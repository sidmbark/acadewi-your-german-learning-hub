-- Create storage policies for payment proofs in the documents bucket

-- Allow authenticated users to upload their own payment proofs
CREATE POLICY "Users can upload their own payment proofs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'payment-proofs'
);

-- Allow users to view their own payment proofs
CREATE POLICY "Users can view their own payment proofs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'payment-proofs'
);

-- Allow gestionnaires to view all payment proofs
CREATE POLICY "Gestionnaires can view all payment proofs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'payment-proofs'
  AND public.has_role(auth.uid(), 'gestionnaire')
);