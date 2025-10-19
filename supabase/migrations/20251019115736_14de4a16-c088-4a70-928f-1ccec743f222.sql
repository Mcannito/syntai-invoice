-- Tabella pazienti
CREATE TABLE public.pazienti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cognome TEXT,
  ragione_sociale TEXT,
  tipo_paziente TEXT NOT NULL CHECK (tipo_paziente IN ('persona_fisica', 'persona_giuridica')),
  codice_fiscale TEXT,
  partita_iva TEXT,
  email TEXT,
  telefono TEXT,
  indirizzo TEXT,
  citta TEXT,
  cap TEXT,
  provincia TEXT,
  pec TEXT,
  codice_destinatario TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT check_persona_fisica CHECK (
    tipo_paziente = 'persona_giuridica' OR 
    (cognome IS NOT NULL AND codice_fiscale IS NOT NULL)
  ),
  CONSTRAINT check_persona_giuridica CHECK (
    tipo_paziente = 'persona_fisica' OR 
    (ragione_sociale IS NOT NULL AND partita_iva IS NOT NULL)
  )
);

-- Indici per ricerca veloce
CREATE INDEX idx_pazienti_codice_fiscale ON public.pazienti(codice_fiscale);
CREATE INDEX idx_pazienti_partita_iva ON public.pazienti(partita_iva);
CREATE INDEX idx_pazienti_tipo ON public.pazienti(tipo_paziente);

-- Enable RLS
ALTER TABLE public.pazienti ENABLE ROW LEVEL SECURITY;

-- Policy per lettura (tutti possono leggere per ora - da raffinare con auth)
CREATE POLICY "Enable read access for all users" ON public.pazienti
  FOR SELECT USING (true);

-- Policy per inserimento (tutti possono inserire per ora - da raffinare con auth)
CREATE POLICY "Enable insert for all users" ON public.pazienti
  FOR INSERT WITH CHECK (true);

-- Policy per update (tutti possono aggiornare per ora - da raffinare con auth)
CREATE POLICY "Enable update for all users" ON public.pazienti
  FOR UPDATE USING (true);

-- Policy per delete (tutti possono eliminare per ora - da raffinare con auth)
CREATE POLICY "Enable delete for all users" ON public.pazienti
  FOR DELETE USING (true);

-- Trigger per aggiornamento automatico updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pazienti_updated_at
  BEFORE UPDATE ON public.pazienti
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();