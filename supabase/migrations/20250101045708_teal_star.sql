-- Create cases bucket for storing processed documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('cases', 'cases', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for cases bucket
CREATE POLICY "Allow admin access to cases"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'cases' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'cases' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);