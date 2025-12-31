-- Add fichier_url and professeur_id to exercices table
ALTER TABLE public.exercices 
ADD COLUMN IF NOT EXISTS fichier_url text,
ADD COLUMN IF NOT EXISTS professeur_id uuid;

-- Make questions optional since we'll use PDF
ALTER TABLE public.exercices 
ALTER COLUMN questions DROP NOT NULL;

-- Add default empty array for questions
ALTER TABLE public.exercices 
ALTER COLUMN questions SET DEFAULT '[]'::jsonb;

-- Add INSERT policy for notifications so professor can notify students
CREATE POLICY "Professeurs can insert notifications for their students"
ON public.notifications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('professeur', 'gestionnaire')
  )
);