-- Add PDF template customization columns to user_settings
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS pdf_template_colore_primario TEXT DEFAULT '#2563eb',
ADD COLUMN IF NOT EXISTS pdf_template_colore_secondario TEXT DEFAULT '#64748b',
ADD COLUMN IF NOT EXISTS pdf_template_font_size TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS pdf_template_mostra_logo BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS pdf_template_posizione_logo TEXT DEFAULT 'left',
ADD COLUMN IF NOT EXISTS pdf_template_footer_text TEXT,
ADD COLUMN IF NOT EXISTS pdf_template_layout TEXT DEFAULT 'classic';

-- Create storage bucket for invoice PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('fatture-pdf', 'fatture-pdf', true)
ON CONFLICT (id) DO NOTHING;

-- Add RLS policies for fatture-pdf bucket
CREATE POLICY "Users can read their own invoice PDFs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'fatture-pdf' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can insert their own invoice PDFs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'fatture-pdf' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own invoice PDFs"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'fatture-pdf' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own invoice PDFs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'fatture-pdf' AND
  (storage.foldername(name))[1] = auth.uid()::text
);