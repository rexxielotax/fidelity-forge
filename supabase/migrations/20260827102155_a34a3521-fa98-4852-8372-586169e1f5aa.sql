-- 1. PROFILE FIELDS ---------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'tier1',
  ADD COLUMN IF NOT EXISTS transfers_locked boolean NOT NULL DEFAULT false;

-- 2. NOTIFICATION UPGRADES --------------------------------------------------
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS link text,
  ADD COLUMN IF NOT EXISTS event_key text;

CREATE UNIQUE INDEX IF NOT EXISTS notifications_event_key_uidx
  ON public.notifications (event_key) WHERE event_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS notifications_user_created_idx
  ON public.notifications (user_id, created_at DESC);

-- 3. SUPPORT MESSAGES -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender text NOT NULL DEFAULT 'user',
  body text,
  image_urls text[] NOT NULL DEFAULT '{}',
  read_by_admin boolean NOT NULL DEFAULT false,
  read_by_user boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.support_messages TO authenticated;
GRANT ALL ON public.support_messages TO service_role;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS support_messages_select_own ON public.support_messages;
CREATE POLICY support_messages_select_own ON public.support_messages
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS support_messages_insert_own ON public.support_messages;
CREATE POLICY support_messages_insert_own ON public.support_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND sender = 'user');
DROP POLICY IF EXISTS support_messages_update_own ON public.support_messages;
CREATE POLICY support_messages_update_own ON public.support_messages
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS support_messages_user_idx
  ON public.support_messages (user_id, created_at);

-- 4. TIER UPGRADE REQUESTS --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tier_upgrade_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_tier text NOT NULL,
  payment_method text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  gift_card_type text,
  gift_card_image_urls text[] NOT NULL DEFAULT '{}',
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tier_upgrade_requests TO authenticated;
GRANT ALL ON public.tier_upgrade_requests TO service_role;
ALTER TABLE public.tier_upgrade_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tier_requests_select_own ON public.tier_upgrade_requests;
CREATE POLICY tier_requests_select_own ON public.tier_upgrade_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP TRIGGER IF EXISTS tier_requests_touch ON public.tier_upgrade_requests;
CREATE TRIGGER tier_requests_touch BEFORE UPDATE ON public.tier_upgrade_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 5. CARD REQUESTS ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.card_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  card_type text NOT NULL,
  delivery_type text NOT NULL,
  payment_method text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  gift_card_type text,
  gift_card_image_urls text[] NOT NULL DEFAULT '{}',
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.card_requests TO authenticated;
GRANT ALL ON public.card_requests TO service_role;
ALTER TABLE public.card_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS card_requests_select_own ON public.card_requests;
CREATE POLICY card_requests_select_own ON public.card_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP TRIGGER IF EXISTS card_requests_touch ON public.card_requests;
CREATE TRIGGER card_requests_touch BEFORE UPDATE ON public.card_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 6. DEPOSIT SETTINGS -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.deposit_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  method text NOT NULL,
  field_key text NOT NULL,
  field_label text NOT NULL,
  field_value text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  notice text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (method, field_key)
);
GRANT SELECT ON public.deposit_settings TO authenticated;
GRANT ALL ON public.deposit_settings TO service_role;
ALTER TABLE public.deposit_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS deposit_settings_read ON public.deposit_settings;
CREATE POLICY deposit_settings_read ON public.deposit_settings
  FOR SELECT TO authenticated USING (true);

-- 7. AUTOMATIC TRANSACTION NOTIFICATIONS ------------------------------------
CREATE OR REPLACE FUNCTION public.notify_transaction_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_title text;
  v_message text;
  v_key text;
  v_amount text := to_char(NEW.amount, 'FM999999999990.00');
  v_credit boolean := NEW.direction = 'credit';
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  IF NEW.status = 'pending' THEN
    v_title := CASE WHEN v_credit THEN 'Deposit initiated' ELSE 'Transaction initiated' END;
    v_message := CASE WHEN v_credit
      THEN 'Your deposit of ' || v_amount || ' is being processed.'
      ELSE 'Your transfer of ' || v_amount || COALESCE(' to ' || NEW.recipient_name, '') || ' is processing.' END;
  ELSIF NEW.status = 'completed' THEN
    v_title := CASE WHEN v_credit THEN 'Money received' ELSE 'Money sent' END;
    v_message := CASE WHEN v_credit
      THEN v_amount || ' has been credited to your account. Ref ' || NEW.reference || '.'
      ELSE v_amount || COALESCE(' sent to ' || NEW.recipient_name, '') || '. Ref ' || NEW.reference || '.' END;
  ELSIF NEW.status = 'failed' THEN
    v_title := 'Transaction failed';
    v_message := 'Transaction ' || NEW.reference || ' of ' || v_amount || ' could not be completed.';
  ELSIF NEW.status = 'cancelled' THEN
    v_title := 'Transaction cancelled';
    v_message := 'Transaction ' || NEW.reference || ' of ' || v_amount || ' was cancelled.';
  ELSE
    RETURN NEW;
  END IF;

  v_key := 'tx:' || NEW.id::text || ':' || NEW.status;

  INSERT INTO public.notifications (user_id, type, title, message, link, event_key)
  VALUES (NEW.user_id, 'transaction', v_title, v_message, '/transactions?tx=' || NEW.id::text, v_key)
  ON CONFLICT (event_key) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS transactions_notify_insert ON public.transactions;
CREATE TRIGGER transactions_notify_insert AFTER INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.notify_transaction_event();

DROP TRIGGER IF EXISTS transactions_notify_update ON public.transactions;
CREATE TRIGGER transactions_notify_update AFTER UPDATE OF status ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.notify_transaction_event();

-- 8. AUTOMATIC SUPPORT NOTIFICATIONS ----------------------------------------
CREATE OR REPLACE FUNCTION public.notify_support_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.sender <> 'admin' THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, message, link, event_key)
  VALUES (
    NEW.user_id,
    'support',
    'New message from Support',
    COALESCE(NULLIF(left(NEW.body, 140), ''), 'Support sent you an attachment.'),
    '/support',
    'support:' || NEW.id::text
  )
  ON CONFLICT (event_key) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS support_messages_notify ON public.support_messages;
CREATE TRIGGER support_messages_notify AFTER INSERT ON public.support_messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_support_message();

REVOKE EXECUTE ON FUNCTION public.notify_transaction_event() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_support_message() FROM public, anon, authenticated;

-- 9. REALTIME ---------------------------------------------------------------
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.support_messages REPLICA IDENTITY FULL;
ALTER TABLE public.transactions REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
