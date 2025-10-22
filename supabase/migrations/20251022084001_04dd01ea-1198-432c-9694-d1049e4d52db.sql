-- Add codice_destinatario_length to pazienti table
ALTER TABLE public.pazienti 
ADD COLUMN IF NOT EXISTS codice_destinatario_length integer;

-- Add comment to explain the field
COMMENT ON COLUMN public.pazienti.codice_destinatario_length IS '6 for PA, 7 for PG';

-- Add payment tracking fields to fatture table
ALTER TABLE public.fatture 
ADD COLUMN IF NOT EXISTS pagata boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS data_pagamento date;

-- Add A-Cube integration fields to fatture table
ALTER TABLE public.fatture 
ADD COLUMN IF NOT EXISTS acube_id text,
ADD COLUMN IF NOT EXISTS acube_status text,
ADD COLUMN IF NOT EXISTS acube_error text,
ADD COLUMN IF NOT EXISTS invio_data timestamp with time zone;

-- Add conversion tracking fields to fatture table
ALTER TABLE public.fatture 
ADD COLUMN IF NOT EXISTS convertita_da_id uuid,
ADD COLUMN IF NOT EXISTS convertita_in_id uuid;

-- Add foreign keys for conversion tracking
ALTER TABLE public.fatture 
ADD CONSTRAINT fatture_convertita_da_fkey 
FOREIGN KEY (convertita_da_id) REFERENCES public.fatture(id) ON DELETE SET NULL;

ALTER TABLE public.fatture 
ADD CONSTRAINT fatture_convertita_in_fkey 
FOREIGN KEY (convertita_in_id) REFERENCES public.fatture(id) ON DELETE SET NULL;

-- Update existing data to match new document types
-- Convert generic 'fattura' to 'fattura_sanitaria' (default type for invoices)
UPDATE public.fatture 
SET tipo_documento = 'fattura_sanitaria' 
WHERE tipo_documento = 'fattura';

-- Update tipo_documento constraint to support all 6 types
ALTER TABLE public.fatture DROP CONSTRAINT IF EXISTS fatture_tipo_documento_check;

ALTER TABLE public.fatture 
ADD CONSTRAINT fatture_tipo_documento_check 
CHECK (tipo_documento IN (
  'fattura_sanitaria', 
  'fattura_elettronica_pg', 
  'fattura_elettronica_pa', 
  'fattura_proforma', 
  'nota_credito', 
  'preventivo'
));

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_fatture_tipo_documento ON public.fatture(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_fatture_pagata ON public.fatture(pagata);
CREATE INDEX IF NOT EXISTS idx_fatture_acube_status ON public.fatture(acube_status);
CREATE INDEX IF NOT EXISTS idx_fatture_convertita_da ON public.fatture(convertita_da_id);

-- Add comments for documentation
COMMENT ON COLUMN public.fatture.tipo_documento IS 'Types: fattura_sanitaria (TS), fattura_elettronica_pg (SDI 7 digits), fattura_elettronica_pa (SDI 6 digits), fattura_proforma (convertible), nota_credito (credit note), preventivo (quote)';
COMMENT ON COLUMN public.fatture.pagata IS 'Payment status';
COMMENT ON COLUMN public.fatture.data_pagamento IS 'Payment date if paid';
COMMENT ON COLUMN public.fatture.acube_id IS 'A-Cube transaction ID';
COMMENT ON COLUMN public.fatture.acube_status IS 'A-Cube submission status';
COMMENT ON COLUMN public.fatture.acube_error IS 'A-Cube error message if any';
COMMENT ON COLUMN public.fatture.invio_data IS 'Submission date to TS/SDI';
COMMENT ON COLUMN public.fatture.convertita_da_id IS 'Reference to original preventivo/proforma';
COMMENT ON COLUMN public.fatture.convertita_in_id IS 'Reference to converted definitive invoice';