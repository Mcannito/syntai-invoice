-- Create appuntamenti table
CREATE TABLE public.appuntamenti (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  paziente_id UUID REFERENCES public.pazienti(id) ON DELETE CASCADE,
  titolo TEXT NOT NULL,
  data DATE NOT NULL,
  ora_inizio TIME NOT NULL,
  ora_fine TIME NOT NULL,
  prestazione_id UUID REFERENCES public.prestazioni(id) ON DELETE SET NULL,
  note TEXT,
  stato TEXT NOT NULL DEFAULT 'programmato',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appuntamenti ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own appuntamenti" 
ON public.appuntamenti 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own appuntamenti" 
ON public.appuntamenti 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appuntamenti" 
ON public.appuntamenti 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appuntamenti" 
ON public.appuntamenti 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_appuntamenti_updated_at
BEFORE UPDATE ON public.appuntamenti
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();