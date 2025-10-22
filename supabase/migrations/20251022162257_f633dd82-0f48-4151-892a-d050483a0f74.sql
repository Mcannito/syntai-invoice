-- Aggiungi colonne per le percentuali personalizzate alla tabella fatture
ALTER TABLE public.fatture 
ADD COLUMN percentuale_rivalsa numeric,
ADD COLUMN percentuale_ritenuta numeric;

-- Aggiungi commenti per documentare le colonne
COMMENT ON COLUMN public.fatture.percentuale_rivalsa IS 'Percentuale di rivalsa/contributo integrativo applicata a questo documento (sovrascrive il default delle impostazioni)';
COMMENT ON COLUMN public.fatture.percentuale_ritenuta IS 'Percentuale di ritenuta d''acconto applicata a questo documento (sovrascrive il default delle impostazioni)';