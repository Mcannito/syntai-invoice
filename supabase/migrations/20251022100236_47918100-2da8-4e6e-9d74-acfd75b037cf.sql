-- Add new fields to user_settings table
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS tipo_persona text CHECK (tipo_persona IN ('fisica', 'giuridica')),
ADD COLUMN IF NOT EXISTS sesso text CHECK (sesso IN ('M', 'F')),
ADD COLUMN IF NOT EXISTS nome text,
ADD COLUMN IF NOT EXISTS cognome text,
ADD COLUMN IF NOT EXISTS albo_nome text,
ADD COLUMN IF NOT EXISTS albo_numero text,
ADD COLUMN IF NOT EXISTS pec text;