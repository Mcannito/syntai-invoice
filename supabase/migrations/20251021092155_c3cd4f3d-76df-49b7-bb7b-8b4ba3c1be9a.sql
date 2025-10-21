-- Aggiorna tabella fatture per supportare tutte le funzionalità
ALTER TABLE public.fatture ADD COLUMN IF NOT EXISTS tipo_documento text NOT NULL DEFAULT 'fattura';
ALTER TABLE public.fatture ADD COLUMN IF NOT EXISTS scadenza_pagamento date;
ALTER TABLE public.fatture ADD COLUMN IF NOT EXISTS imponibile numeric DEFAULT 0;
ALTER TABLE public.fatture ADD COLUMN IF NOT EXISTS iva_importo numeric DEFAULT 0;
ALTER TABLE public.fatture ADD COLUMN IF NOT EXISTS cassa_previdenziale numeric DEFAULT 0;
ALTER TABLE public.fatture ADD COLUMN IF NOT EXISTS ritenuta_acconto numeric DEFAULT 0;
ALTER TABLE public.fatture ADD COLUMN IF NOT EXISTS contributo_integrativo numeric DEFAULT 0;
ALTER TABLE public.fatture ADD COLUMN IF NOT EXISTS bollo_virtuale numeric DEFAULT 0;
ALTER TABLE public.fatture ADD COLUMN IF NOT EXISTS totale numeric DEFAULT 0;
ALTER TABLE public.fatture ADD COLUMN IF NOT EXISTS xml_path text;
ALTER TABLE public.fatture ADD COLUMN IF NOT EXISTS pdf_path text;
ALTER TABLE public.fatture ADD COLUMN IF NOT EXISTS sdi_id text;
ALTER TABLE public.fatture ADD COLUMN IF NOT EXISTS sdi_stato text;
ALTER TABLE public.fatture ADD COLUMN IF NOT EXISTS ts_inviata boolean DEFAULT false;
ALTER TABLE public.fatture ADD COLUMN IF NOT EXISTS email_inviata boolean DEFAULT false;
ALTER TABLE public.fatture ADD COLUMN IF NOT EXISTS fattura_originale_id uuid;

-- Crea tabella per i dettagli delle fatture (righe)
CREATE TABLE IF NOT EXISTS public.fatture_dettagli (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fattura_id uuid NOT NULL REFERENCES public.fatture(id) ON DELETE CASCADE,
  prestazione_id uuid REFERENCES public.prestazioni(id),
  descrizione text NOT NULL,
  quantita numeric NOT NULL DEFAULT 1,
  prezzo_unitario numeric NOT NULL,
  sconto numeric DEFAULT 0,
  iva_percentuale numeric DEFAULT 0,
  imponibile numeric NOT NULL,
  iva_importo numeric NOT NULL,
  totale numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on fatture_dettagli
ALTER TABLE public.fatture_dettagli ENABLE ROW LEVEL SECURITY;

-- Create policies for fatture_dettagli
CREATE POLICY "Users can view their own fatture_dettagli"
ON public.fatture_dettagli
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.fatture
    WHERE fatture.id = fatture_dettagli.fattura_id
    AND fatture.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own fatture_dettagli"
ON public.fatture_dettagli
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.fatture
    WHERE fatture.id = fatture_dettagli.fattura_id
    AND fatture.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own fatture_dettagli"
ON public.fatture_dettagli
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.fatture
    WHERE fatture.id = fatture_dettagli.fattura_id
    AND fatture.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own fatture_dettagli"
ON public.fatture_dettagli
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.fatture
    WHERE fatture.id = fatture_dettagli.fattura_id
    AND fatture.user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates on fatture_dettagli
CREATE TRIGGER update_fatture_dettagli_updated_at
BEFORE UPDATE ON public.fatture_dettagli
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Crea tabella per le spese (fatture in entrata)
CREATE TABLE IF NOT EXISTS public.spese (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  numero text NOT NULL,
  data date NOT NULL,
  fornitore text NOT NULL,
  descrizione text,
  importo numeric NOT NULL,
  iva_importo numeric DEFAULT 0,
  totale numeric NOT NULL,
  categoria text,
  file_path text,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on spese
ALTER TABLE public.spese ENABLE ROW LEVEL SECURITY;

-- Create policies for spese
CREATE POLICY "Users can view their own spese"
ON public.spese
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own spese"
ON public.spese
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spese"
ON public.spese
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spese"
ON public.spese
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on spese
CREATE TRIGGER update_spese_updated_at
BEFORE UPDATE ON public.spese
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();