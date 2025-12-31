-- Add storage policies for the documents bucket

-- Allow students to upload their exercise submissions
CREATE POLICY "Students can upload exercise submissions"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow students to view their own uploads
CREATE POLICY "Students can view their own uploads"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow professors to upload exercise files
CREATE POLICY "Professors can upload exercise files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND public.has_role(auth.uid(), 'professeur')
);

-- Allow everyone to view public exercise files (for downloading statements)
CREATE POLICY "Anyone can view exercise files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'exercices'
);

-- Allow professors to delete their files
CREATE POLICY "Professors can delete their files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND public.has_role(auth.uid(), 'professeur')
);