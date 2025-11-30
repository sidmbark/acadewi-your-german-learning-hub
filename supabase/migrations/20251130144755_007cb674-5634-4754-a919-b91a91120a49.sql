-- Créer un bucket storage pour les documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true);

-- Politique pour voir les documents
CREATE POLICY "Les documents sont visibles par tous"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

-- Politique pour uploader des documents (professeurs uniquement)
CREATE POLICY "Les professeurs peuvent uploader des documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'professeur'
  )
);

-- Politique pour supprimer des documents (professeurs uniquement)
CREATE POLICY "Les professeurs peuvent supprimer des documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'professeur'
  )
);

-- Table pour lier les documents aux groupes (un document peut être accessible par plusieurs groupes)
CREATE TABLE public.document_groupe_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  groupe_id UUID REFERENCES public.groupes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(document_id, groupe_id)
);

-- RLS pour document_groupe_access
ALTER TABLE public.document_groupe_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les accès documents"
ON public.document_groupe_access FOR SELECT
USING (true);

CREATE POLICY "Les professeurs peuvent gérer les accès documents"
ON public.document_groupe_access FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'professeur'
  )
);

-- Table pour les soumissions d'exercices
CREATE TABLE public.exercice_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exercice_id UUID REFERENCES public.exercices(id) ON DELETE CASCADE,
  etudiant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reponses JSONB NOT NULL,
  fichiers_urls TEXT[],
  date_soumission TIMESTAMP WITH TIME ZONE DEFAULT now(),
  commentaire_prof TEXT,
  note NUMERIC,
  corrige BOOLEAN DEFAULT false
);

-- RLS pour exercice_submissions
ALTER TABLE public.exercice_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les étudiants peuvent voir leurs soumissions"
ON public.exercice_submissions FOR SELECT
USING (etudiant_id = auth.uid());

CREATE POLICY "Les étudiants peuvent créer leurs soumissions"
ON public.exercice_submissions FOR INSERT
WITH CHECK (etudiant_id = auth.uid());

CREATE POLICY "Les professeurs peuvent voir toutes les soumissions"
ON public.exercice_submissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'professeur'
  )
);

CREATE POLICY "Les professeurs peuvent mettre à jour les soumissions"
ON public.exercice_submissions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'professeur'
  )
);

-- Ajouter une colonne professeur_id à la table documents
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS professeur_id UUID REFERENCES public.profiles(id);

-- Supprimer la colonne cours_id car maintenant les documents sont liés aux groupes via document_groupe_access
-- Note: On la garde pour compatibilité mais elle ne sera plus utilisée pour les nouveaux documents