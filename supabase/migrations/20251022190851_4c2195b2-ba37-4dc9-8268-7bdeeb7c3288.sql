-- Create storage bucket for fatture in entrata PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('fatture-in-entrata', 'fatture-in-entrata', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for fatture-in-entrata bucket
CREATE POLICY "Users can view their own fatture PDFs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'fatture-in-entrata' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can upload their own fatture PDFs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'fatture-in-entrata' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own fatture PDFs"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'fatture-in-entrata' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own fatture PDFs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'fatture-in-entrata' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);