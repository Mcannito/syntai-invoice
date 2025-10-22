-- Aggiungi colonna per testo centrale nel template PDF
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS pdf_template_testo_centrale text;