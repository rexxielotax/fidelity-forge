
-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  country TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  notify_push BOOLEAN NOT NULL DEFAULT true,
  notify_email BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ACCOUNTS
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('checking','savings')),
  balance NUMERIC(16,2) NOT NULL DEFAULT 0,
  account_number TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, type)
);
GRANT SELECT ON public.accounts TO authenticated;
GRANT ALL ON public.accounts TO service_role;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "accounts_select_own" ON public.accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- TRANSACTIONS
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  direction TEXT NOT NULL CHECK (direction IN ('credit','debit')),
  category TEXT NOT NULL DEFAULT 'transfer',
  amount NUMERIC(16,2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','cancelled')),
  recipient_name TEXT,
  recipient_bank TEXT,
  recipient_account TEXT,
  routing_number TEXT,
  description TEXT,
  reference TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX transactions_user_created_idx ON public.transactions (user_id, created_at DESC);
GRANT SELECT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transactions_select_own" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- CARDS
CREATE TABLE public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  card_type TEXT NOT NULL DEFAULT 'standard',
  masked_number TEXT NOT NULL,
  holder_name TEXT NOT NULL,
  expiry TEXT NOT NULL,
  daily_limit NUMERIC(16,2) NOT NULL DEFAULT 5000,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','locked','lost','cancelled')),
  fee_paid NUMERIC(16,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cards TO authenticated;
GRANT ALL ON public.cards TO service_role;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cards_select_own" ON public.cards FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- CARD SECRETS (server-only)
CREATE TABLE public.card_secrets (
  card_id UUID PRIMARY KEY REFERENCES public.cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  pin TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.card_secrets TO service_role;
ALTER TABLE public.card_secrets ENABLE ROW LEVEL SECURITY;

-- RECIPIENTS
CREATE TABLE public.recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  bank TEXT NOT NULL,
  account_number TEXT NOT NULL,
  routing_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipients TO authenticated;
GRANT ALL ON public.recipients TO service_role;
ALTER TABLE public.recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recipients_all_own" ON public.recipients FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('transaction','security','promotion','system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_idx ON public.notifications (user_id, created_at DESC);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- SUPPORT TICKETS
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','resolved')),
  admin_reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tickets_select_own" ON public.support_tickets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "tickets_insert_own" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ADMIN AUDIT LOG (server-only)
CREATE TABLE public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_user_id UUID,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_actions TO service_role;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- NEW USER BOOTSTRAP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), COALESCE(NEW.email, ''))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.accounts (user_id, type, account_number)
  VALUES
    (NEW.id, 'checking', '4' || lpad((floor(random()*1000000000))::bigint::text, 9, '0')),
    (NEW.id, 'savings',  '7' || lpad((floor(random()*1000000000))::bigint::text, 9, '0'))
  ON CONFLICT DO NOTHING;

  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (NEW.id, 'system', 'Welcome aboard', 'Your checking and savings accounts are ready. This is a simulated banking environment.');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER tickets_touch BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

create table if not exists public.deposit_settings (
  id uuid primary key default gen_random_uuid(),

  method text not null,
  field_key text not null,
  field_label text not null,
  field_value text not null default '',

  description text not null default '',
  notice text not null default '',

  updated_at timestamptz not null default now(),
  updated_by uuid null,

  unique (method, field_key)
);

create index if not exists deposit_settings_method_idx
on public.deposit_settings(method);

alter table public.deposit_settings enable row level security;

create policy "authenticated users can read deposit settings"
on public.deposit_settings
for select
to authenticated
using (true);

create policy "service role manages deposit settings"
on public.deposit_settings
for all
to service_role
using (true)
with check (true);

insert into public.deposit_settings
  (method, field_key, field_label, field_value, description, notice)
values
  (
    'paypal',
    'account_name',
    'Account name',
    'Nirmal Bank Demo',
    'Use the simulated PayPal account details below.',
    'Demo only — this PayPal account is not a real receiving account.'
  ),
  (
    'paypal',
    'account',
    'PayPal account',
    'demo-paypal@nirmalbank.test',
    'Use the simulated PayPal account details below.',
    'Demo only — this PayPal account is not a real receiving account.'
  ),

  (
    'cashapp',
    'account_name',
    'Account name',
    'Nirmal Bank Demo',
    'Use the simulated Cash App details below.',
    'Demo only — this Cash App identifier is not connected to a real account.'
  ),
  (
    'cashapp',
    'account',
    'Cash App',
    '$NirmalBankDemo',
    'Use the simulated Cash App details below.',
    'Demo only — this Cash App identifier is not connected to a real account.'
  ),

  (
    'bank_transfer',
    'bank_name',
    'Bank name',
    'Nirmal Bank — Demo',
    'Use these simulated banking details when making your demo transfer.',
    'Demo only — these banking details are placeholders and cannot receive real funds.'
  ),
  (
    'bank_transfer',
    'account_name',
    'Account name',
    'Nirmal Bank Demo Account',
    'Use these simulated banking details when making your demo transfer.',
    'Demo only — these banking details are placeholders and cannot receive real funds.'
  ),
  (
    'bank_transfer',
    'account_number',
    'Account number',
    '0000000000',
    'Use these simulated banking details when making your demo transfer.',
    'Demo only — these banking details are placeholders and cannot receive real funds.'
  ),
  (
    'bank_transfer',
    'routing_number',
    'Routing number',
    '000000000',
    'Use these simulated banking details when making your demo transfer.',
    'Demo only — these banking details are placeholders and cannot receive real funds.'
  ),
  (
    'bank_transfer',
    'swift',
    'SWIFT / BIC',
    'DEMONGB0XXX',
    'Use these simulated banking details when making your demo transfer.',
    'Demo only — these banking details are placeholders and cannot receive real funds.'
  ),

  (
    'usdt',
    'network',
    'Network',
    'TRC20',
    'Select the network shown below.',
    'Demo only — this is not a real blockchain address.'
  ),
  (
    'usdt',
    'address',
    'USDT address',
    'DEMO-USDT-TRC20-ADDRESS',
    'Use the simulated USDT deposit address below.',
    'Demo only — this is not a real blockchain address. Do not send real cryptocurrency to it.'
  ),

  (
    'btc',
    'network',
    'Network',
    'Bitcoin',
    'Use the simulated Bitcoin deposit address below.',
    'Demo only — this is not a real blockchain network.'
  ),
  (
    'btc',
    'address',
    'BTC address',
    'DEMO-BTC-ADDRESS',
    'Use the simulated Bitcoin deposit address below.',
    'Demo only  this is not a real Bitcoin address. Do not send real cryptocurrency to it.'
  )

on conflict (method, field_key) do nothing;