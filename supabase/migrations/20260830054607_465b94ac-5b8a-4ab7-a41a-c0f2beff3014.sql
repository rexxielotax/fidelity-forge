DROP INDEX IF EXISTS public.notifications_event_key_uidx;
CREATE UNIQUE INDEX notifications_event_key_uidx ON public.notifications (event_key);