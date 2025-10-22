-- Crea bucket per i logo
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true);

-- Crea tabella per le impostazioni utente
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  logo_path TEXT,
  regime_fiscale TEXT DEFAULT 'forfettario',
  cassa_previdenziale TEXT DEFAULT 'enpam',
  aliquota_cassa NUMERIC DEFAULT 4,
  ritenuta_acconto NUMERIC DEFAULT 20,
  metodo_pagamento_default TEXT DEFAULT 'bonifico',
  iban TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Abilita RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Policy per visualizzare le proprie impostazioni
CREATE POLICY "Users can view their own settings"
  ON public.user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy per creare le proprie impostazioni
CREATE POLICY "Users can create their own settings"
  ON public.user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy per aggiornare le proprie impostazioni
CREATE POLICY "Users can update their own settings"
  ON public.user_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy per storage: gli utenti possono caricare i propri logo
CREATE POLICY "Users can upload their own logos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy per storage: gli utenti possono visualizzare i propri logo
CREATE POLICY "Users can view their own logos"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy per storage: gli utenti possono aggiornare i propri logo
CREATE POLICY "Users can update their own logos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy per storage: gli utenti possono eliminare i propri logo
CREATE POLICY "Users can delete their own logos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy per permettere a tutti di vedere i logo (pubblici)
CREATE POLICY "Logos are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'logos');

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();