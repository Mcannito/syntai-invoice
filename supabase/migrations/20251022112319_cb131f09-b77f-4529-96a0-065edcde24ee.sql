-- Aggiungi campo specializzazione alla tabella user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS specializzazione text;