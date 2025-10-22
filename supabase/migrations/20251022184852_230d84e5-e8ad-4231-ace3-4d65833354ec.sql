-- Crea tabella per le fatture in entrata (ricevute)
CREATE TABLE public.fatture_in_entrata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  numero VARCHAR(50) NOT NULL,
  data DATE NOT NULL,
  fornitore VARCHAR(255) NOT NULL,
  partita_iva VARCHAR(50),
  codice_fiscale VARCHAR(16),
  importo NUMERIC(10,2) NOT NULL,
  imponibile NUMERIC(10,2) NOT NULL,
  iva_importo NUMERIC(10,2) DEFAULT 0,
  descrizione TEXT,
  categoria VARCHAR(100),
  metodo_pagamento VARCHAR(50),
  pagata BOOLEAN DEFAULT false,
  data_pagamento DATE,
  xml_path TEXT,
  pdf_path TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Abilita RLS
ALTER TABLE public.fatture_in_entrata ENABLE ROW LEVEL SECURITY;

-- Policy per visualizzare le proprie fatture in entrata
CREATE POLICY "Gli utenti possono visualizzare le proprie fatture in entrata"
  ON public.fatture_in_entrata
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy per inserire le proprie fatture in entrata
CREATE POLICY "Gli utenti possono inserire le proprie fatture in entrata"
  ON public.fatture_in_entrata
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy per aggiornare le proprie fatture in entrata
CREATE POLICY "Gli utenti possono aggiornare le proprie fatture in entrata"
  ON public.fatture_in_entrata
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy per eliminare le proprie fatture in entrata
CREATE POLICY "Gli utenti possono eliminare le proprie fatture in entrata"
  ON public.fatture_in_entrata
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_fatture_in_entrata_updated_at
  BEFORE UPDATE ON public.fatture_in_entrata
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indici per migliorare le performance
CREATE INDEX idx_fatture_in_entrata_user_id ON public.fatture_in_entrata(user_id);
CREATE INDEX idx_fatture_in_entrata_data ON public.fatture_in_entrata(data DESC);

-- Commenti
COMMENT ON TABLE public.fatture_in_entrata IS 'Fatture ricevute da fornitori';
COMMENT ON COLUMN public.fatture_in_entrata.fornitore IS 'Nome del fornitore che ha emesso la fattura';
COMMENT ON COLUMN public.fatture_in_entrata.categoria IS 'Categoria di spesa (es: materiali, affitto, utenze, etc.)';
