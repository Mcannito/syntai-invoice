-- Aggiungere colonne per gestire lo sconto nei pacchetti
ALTER TABLE pacchetti 
ADD COLUMN prezzo_listino NUMERIC,
ADD COLUMN sconto_percentuale NUMERIC DEFAULT 0,
ADD COLUMN sconto_importo NUMERIC DEFAULT 0;

-- Aggiornare dati esistenti
UPDATE pacchetti 
SET prezzo_listino = prezzo_totale,
    sconto_percentuale = 0,
    sconto_importo = 0
WHERE prezzo_listino IS NULL;

-- Rendere prezzo_listino NOT NULL dopo aver popolato i dati
ALTER TABLE pacchetti 
ALTER COLUMN prezzo_listino SET NOT NULL;