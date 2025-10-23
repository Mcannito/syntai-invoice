-- Aggiungere colonna per la data della fattura originale nelle note di credito
ALTER TABLE fatture 
ADD COLUMN fattura_originale_data date;