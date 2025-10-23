-- Creare tabella document_templates per template personalizzati per ogni tipo di documento
CREATE TABLE IF NOT EXISTS public.document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'fattura_sanitaria',
    'fattura_elettronica_pg',
    'fattura_elettronica_pa',
    'preventivo',
    'fattura_proforma',
    'nota_credito'
  )),
  
  -- Template settings (stessi campi attuali di user_settings)
  colore_primario TEXT NOT NULL DEFAULT '#2563eb',
  colore_secondario TEXT NOT NULL DEFAULT '#64748b',
  font_size TEXT NOT NULL DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
  mostra_logo BOOLEAN NOT NULL DEFAULT true,
  posizione_logo TEXT NOT NULL DEFAULT 'left' CHECK (posizione_logo IN ('left', 'center', 'right')),
  footer_text TEXT,
  layout TEXT NOT NULL DEFAULT 'classic' CHECK (layout IN ('classic', 'modern', 'minimal', 'elegant', 'bold')),
  testo_centrale TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, document_type)
);

-- Indice per query frequenti
CREATE INDEX idx_document_templates_user_type ON public.document_templates(user_id, document_type);

-- Enable RLS
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own templates"
  ON public.document_templates
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates"
  ON public.document_templates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
  ON public.document_templates
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON public.document_templates
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger per updated_at
CREATE TRIGGER update_document_templates_updated_at
  BEFORE UPDATE ON public.document_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();