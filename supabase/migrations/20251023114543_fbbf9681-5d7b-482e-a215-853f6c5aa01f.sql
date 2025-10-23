-- Creazione tabella pacchetti
CREATE TABLE public.pacchetti (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  paziente_id UUID NOT NULL REFERENCES public.pazienti(id) ON DELETE CASCADE,
  prestazione_id UUID NOT NULL REFERENCES public.prestazioni(id) ON DELETE CASCADE,
  
  -- Dettagli del pacchetto
  nome TEXT NOT NULL,
  quantita_totale INTEGER NOT NULL CHECK (quantita_totale > 0),
  quantita_utilizzata INTEGER NOT NULL DEFAULT 0 CHECK (quantita_utilizzata >= 0),
  quantita_rimanente INTEGER GENERATED ALWAYS AS (quantita_totale - quantita_utilizzata) STORED,
  
  -- Informazioni economiche
  prezzo_totale NUMERIC NOT NULL CHECK (prezzo_totale >= 0),
  prezzo_per_seduta NUMERIC NOT NULL CHECK (prezzo_per_seduta >= 0),
  
  -- Riferimento alla fattura di acquisto
  fattura_id UUID REFERENCES public.fatture(id) ON DELETE SET NULL,
  
  -- Stato e validità
  stato TEXT NOT NULL DEFAULT 'attivo' CHECK (stato IN ('attivo', 'completato', 'scaduto', 'annullato')),
  data_acquisto DATE NOT NULL,
  data_scadenza DATE,
  
  -- Note
  note TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Abilita RLS
ALTER TABLE public.pacchetti ENABLE ROW LEVEL SECURITY;

-- Policy SELECT
CREATE POLICY "Users can view their own pacchetti"
  ON public.pacchetti
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy INSERT
CREATE POLICY "Users can create their own pacchetti"
  ON public.pacchetti
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy UPDATE
CREATE POLICY "Users can update their own pacchetti"
  ON public.pacchetti
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy DELETE
CREATE POLICY "Users can delete their own pacchetti"
  ON public.pacchetti
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger per updated_at
CREATE TRIGGER update_pacchetti_updated_at
  BEFORE UPDATE ON public.pacchetti
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Aggiunta colonna pacchetto_id alla tabella appuntamenti
ALTER TABLE public.appuntamenti 
ADD COLUMN pacchetto_id UUID REFERENCES public.pacchetti(id) ON DELETE SET NULL;

-- Funzione per gestire il completamento degli appuntamenti
CREATE OR REPLACE FUNCTION public.handle_appuntamento_completato()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se l'appuntamento è stato appena marcato come completato e ha un pacchetto associato
  IF NEW.stato = 'completato' AND NEW.pacchetto_id IS NOT NULL THEN
    UPDATE public.pacchetti
    SET quantita_utilizzata = quantita_utilizzata + 1,
        stato = CASE 
          WHEN quantita_utilizzata + 1 >= quantita_totale THEN 'completato'
          ELSE stato
        END,
        updated_at = now()
    WHERE id = NEW.pacchetto_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger per appuntamenti completati
CREATE TRIGGER trigger_appuntamento_completato
  AFTER UPDATE ON public.appuntamenti
  FOR EACH ROW
  WHEN (NEW.stato = 'completato' AND OLD.stato != 'completato')
  EXECUTE FUNCTION public.handle_appuntamento_completato();