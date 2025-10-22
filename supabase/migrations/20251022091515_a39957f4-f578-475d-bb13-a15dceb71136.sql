-- Add fatturato column to appuntamenti table to track invoiced services
ALTER TABLE public.appuntamenti 
ADD COLUMN fatturato boolean NOT NULL DEFAULT false;

-- Add index for better query performance
CREATE INDEX idx_appuntamenti_fatturato ON public.appuntamenti(fatturato) WHERE fatturato = false;

-- Add comment to document the column
COMMENT ON COLUMN public.appuntamenti.fatturato IS 'Indicates if the appointment has been invoiced';