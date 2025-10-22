-- Aggiungi colonne per gestire i metodi di pagamento e le impostazioni fiscali
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS metodi_pagamento TEXT[] DEFAULT ARRAY['bonifico'],
ADD COLUMN IF NOT EXISTS altro_metodo_pagamento TEXT,
ADD COLUMN IF NOT EXISTS nome_banca TEXT,
ADD COLUMN IF NOT EXISTS intestatario_cc TEXT,
ADD COLUMN IF NOT EXISTS bic_swift TEXT,
ADD COLUMN IF NOT EXISTS rivalsa_attiva BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS rivalsa_percentuale NUMERIC DEFAULT 4,
ADD COLUMN IF NOT EXISTS rivalsa_applicazione TEXT DEFAULT 'separata',
ADD COLUMN IF NOT EXISTS ritenuta_attiva BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ritenuta_aliquota NUMERIC DEFAULT 20,
ADD COLUMN IF NOT EXISTS ritenuta_tipo TEXT DEFAULT 'persone-fisiche',
ADD COLUMN IF NOT EXISTS ritenuta_causale TEXT DEFAULT 'A',
ADD COLUMN IF NOT EXISTS bollo_attivo BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bollo_importo NUMERIC DEFAULT 2.00,
ADD COLUMN IF NOT EXISTS bollo_carico TEXT DEFAULT 'paziente',
ADD COLUMN IF NOT EXISTS bollo_virtuale BOOLEAN DEFAULT false;