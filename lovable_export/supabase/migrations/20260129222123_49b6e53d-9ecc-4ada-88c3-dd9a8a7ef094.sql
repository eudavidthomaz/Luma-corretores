-- Add contract_file_url column for PDF/DOC contract uploads
ALTER TABLE public.proposals 
ADD COLUMN IF NOT EXISTS contract_file_url TEXT DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN public.proposals.contract_file_url IS 'URL for uploaded contract PDF/DOC file';

-- Create storage policy for proposal-files bucket if needed
-- Allow owners to manage files
DO $$
BEGIN
  -- Policy: Owners can upload files
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Owner proposal files upload'
  ) THEN
    CREATE POLICY "Owner proposal files upload"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'proposal-files' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;

  -- Policy: Owners can view their files
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Owner proposal files view'
  ) THEN
    CREATE POLICY "Owner proposal files view"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'proposal-files' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;

  -- Policy: Owners can update their files
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Owner proposal files update'
  ) THEN
    CREATE POLICY "Owner proposal files update"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'proposal-files' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;

  -- Policy: Owners can delete their files
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Owner proposal files delete'
  ) THEN
    CREATE POLICY "Owner proposal files delete"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'proposal-files' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;

  -- Policy: Public access to signed contracts (read-only, signatures and receipts)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public proposal files read'
  ) THEN
    CREATE POLICY "Public proposal files read"
    ON storage.objects FOR SELECT
    TO anon
    USING (bucket_id = 'proposal-files' AND (storage.foldername(name))[2] = 'signatures');
  END IF;
END $$;