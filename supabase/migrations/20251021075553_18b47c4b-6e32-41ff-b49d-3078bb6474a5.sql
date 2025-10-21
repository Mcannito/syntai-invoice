-- Create fatture table
CREATE TABLE public.fatture (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  numero TEXT NOT NULL,
  data DATE NOT NULL,
  paziente_id UUID REFERENCES public.pazienti(id),
  importo NUMERIC NOT NULL,
  stato TEXT NOT NULL DEFAULT 'Da Inviare',
  metodo_pagamento TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fatture ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own fatture"
ON public.fatture
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own fatture"
ON public.fatture
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fatture"
ON public.fatture
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fatture"
ON public.fatture
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_fatture_updated_at
BEFORE UPDATE ON public.fatture
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();