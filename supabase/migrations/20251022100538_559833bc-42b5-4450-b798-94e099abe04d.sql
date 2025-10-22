-- Add missing fields to user_settings table
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS qualifica text,
ADD COLUMN IF NOT EXISTS codice_fiscale text,
ADD COLUMN IF NOT EXISTS partita_iva text,
ADD COLUMN IF NOT EXISTS indirizzo text,
ADD COLUMN IF NOT EXISTS citta text,
ADD COLUMN IF NOT EXISTS telefono text,
ADD COLUMN IF NOT EXISTS email text;