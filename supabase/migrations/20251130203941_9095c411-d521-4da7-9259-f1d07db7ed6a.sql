-- Ajouter la colonne niveau au profil étudiant pour stocker le niveau assigné
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS niveau text;

-- Créer un commentaire pour expliquer la colonne
COMMENT ON COLUMN public.profiles.niveau IS 'Niveau assigné par le gestionnaire lors de la validation (A1, A2, B1, B2, C1, C2)';

-- Mettre à jour la politique RLS pour les cours : seuls les étudiants validés peuvent les voir
DROP POLICY IF EXISTS "Everyone can view cours" ON public.cours;

CREATE POLICY "Only validated students can view cours"
ON public.cours
FOR SELECT
USING (
  -- Gestionnaires peuvent tout voir
  has_role(auth.uid(), 'gestionnaire'::app_role)
  OR
  -- Professeurs peuvent voir leurs cours
  (has_role(auth.uid(), 'professeur'::app_role) AND (professeur_id = auth.uid() OR professeur_id IS NULL))
  OR
  -- Étudiants validés peuvent voir les cours de leur groupe
  (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND statut = 'valide'
  ))
);

-- Mettre à jour la politique RLS pour les exercices : seuls les étudiants validés peuvent les voir
DROP POLICY IF EXISTS "Everyone can view exercices" ON public.exercices;

CREATE POLICY "Only validated students can view exercices"
ON public.exercices
FOR SELECT
USING (
  -- Gestionnaires et professeurs peuvent tout voir
  has_role(auth.uid(), 'gestionnaire'::app_role)
  OR has_role(auth.uid(), 'professeur'::app_role)
  OR
  -- Étudiants validés peuvent voir les exercices
  (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND statut = 'valide'
  ))
);

-- Mettre à jour la politique RLS pour les documents : seuls les étudiants validés peuvent les voir
DROP POLICY IF EXISTS "Everyone can view documents" ON public.documents;

CREATE POLICY "Only validated students can view documents"
ON public.documents
FOR SELECT
USING (
  -- Gestionnaires et professeurs peuvent tout voir
  has_role(auth.uid(), 'gestionnaire'::app_role)
  OR has_role(auth.uid(), 'professeur'::app_role)
  OR
  -- Étudiants validés peuvent voir les documents
  (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND statut = 'valide'
  ))
);