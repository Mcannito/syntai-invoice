-- Create prestazioni table
CREATE TABLE public.prestazioni (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  codice TEXT NOT NULL,
  prezzo NUMERIC(10, 2) NOT NULL,
  iva TEXT NOT NULL DEFAULT 'Esente IVA Art.10',
  categoria TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prestazioni ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own prestazioni" 
ON public.prestazioni 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own prestazioni" 
ON public.prestazioni 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prestazioni" 
ON public.prestazioni 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prestazioni" 
ON public.prestazioni 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_prestazioni_updated_at
BEFORE UPDATE ON public.prestazioni
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();