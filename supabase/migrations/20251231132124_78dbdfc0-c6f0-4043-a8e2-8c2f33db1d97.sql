-- Drop the existing check constraint
ALTER TABLE public.exercices DROP CONSTRAINT IF EXISTS exercices_type_check;

-- Add new check constraint with all allowed types
ALTER TABLE public.exercices ADD CONSTRAINT exercices_type_check 
CHECK (type IN ('quiz', 'devoir', 'examen'));