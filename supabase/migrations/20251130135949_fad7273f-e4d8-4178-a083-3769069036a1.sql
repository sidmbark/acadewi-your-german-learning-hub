-- Update profiles statut check constraint to support professor-specific statuses
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_statut_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_statut_check
CHECK (
  statut IS NULL OR
  statut IN (
    'en_attente',
    'valide',
    'refuse',
    'en_attente_prof',
    'valide_prof',
    'refuse_prof'
  )
);