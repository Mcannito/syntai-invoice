-- 1. Migliorare la funzione per gestire il conteggio delle sedute del pacchetto
CREATE OR REPLACE FUNCTION public.handle_appuntamento_completato()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Caso 1: Appuntamento appena completato con pacchetto
  IF NEW.stato = 'completato' AND NEW.pacchetto_id IS NOT NULL THEN
    -- Verifica se l'appuntamento era precedentemente non completato
    IF OLD.stato IS NULL OR OLD.stato != 'completato' THEN
      UPDATE public.pacchetti
      SET quantita_utilizzata = quantita_utilizzata + 1,
          stato = CASE 
            WHEN quantita_utilizzata + 1 >= quantita_totale THEN 'completato'
            ELSE stato
          END,
          updated_at = now()
      WHERE id = NEW.pacchetto_id;
    END IF;
  END IF;
  
  -- Caso 2: Appuntamento precedentemente completato ora non più completato
  IF OLD.stato = 'completato' AND NEW.stato != 'completato' AND NEW.pacchetto_id IS NOT NULL THEN
    UPDATE public.pacchetti
    SET quantita_utilizzata = GREATEST(quantita_utilizzata - 1, 0),
        stato = CASE 
          WHEN stato = 'completato' THEN 'attivo'
          ELSE stato
        END,
        updated_at = now()
    WHERE id = NEW.pacchetto_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 2. Ricreare il trigger per assicurarsi che sia attivo
DROP TRIGGER IF EXISTS trigger_handle_appuntamento_completato ON appuntamenti;

CREATE TRIGGER trigger_handle_appuntamento_completato
AFTER INSERT OR UPDATE OF stato ON appuntamenti
FOR EACH ROW
EXECUTE FUNCTION handle_appuntamento_completato();

-- 3. Creare funzione per impostare automaticamente fatturato=true per appuntamenti con pacchetto
CREATE OR REPLACE FUNCTION set_fatturato_for_pacchetto()
RETURNS TRIGGER AS $$
BEGIN
  -- Se l'appuntamento ha un pacchetto, deve essere marcato come fatturato
  IF NEW.pacchetto_id IS NOT NULL THEN
    NEW.fatturato = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Creare trigger per il campo fatturato
DROP TRIGGER IF EXISTS trigger_set_fatturato_for_pacchetto ON appuntamenti;

CREATE TRIGGER trigger_set_fatturato_for_pacchetto
BEFORE INSERT OR UPDATE ON appuntamenti
FOR EACH ROW
EXECUTE FUNCTION set_fatturato_for_pacchetto();

-- 5. Correggere i dati esistenti: impostare fatturato=true per tutti gli appuntamenti con pacchetto
UPDATE appuntamenti
SET fatturato = true
WHERE pacchetto_id IS NOT NULL;

-- 6. Ricalcolare quantita_utilizzata per ogni pacchetto basandosi sugli appuntamenti completati
UPDATE pacchetti p
SET 
  quantita_utilizzata = (
    SELECT COUNT(*)
    FROM appuntamenti a
    WHERE a.pacchetto_id = p.id 
    AND a.stato = 'completato'
  ),
  stato = CASE
    WHEN (
      SELECT COUNT(*)
      FROM appuntamenti a
      WHERE a.pacchetto_id = p.id 
      AND a.stato = 'completato'
    ) >= quantita_totale THEN 'completato'
    ELSE stato
  END,
  updated_at = now();