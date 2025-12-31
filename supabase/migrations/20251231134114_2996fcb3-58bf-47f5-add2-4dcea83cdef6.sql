-- Drop existing policies to recreate them correctly
DROP POLICY IF EXISTS "Students can upload exercise submissions" ON storage.objects;
DROP POLICY IF EXISTS "Students can view their own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Professors can upload exercise files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view exercise files" ON storage.objects;
DROP POLICY IF EXISTS "Professors can delete their files" ON storage.objects;

-- Allow authenticated users to upload to the documents bucket
-- Students upload to their own folder (userId/filename)
CREATE POLICY "Authenticated users can upload to documents bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Allow authenticated users to view all files in documents bucket (it's public anyway)
CREATE POLICY "Authenticated users can view documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow professors to delete files
CREATE POLICY "Professors can delete files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND public.has_role(auth.uid(), 'professeur'));