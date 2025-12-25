-- Table pour les devoirs et examens
CREATE TABLE public.evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titre TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('devoir', 'examen', 'quiz')),
  date_limite TIMESTAMP WITH TIME ZONE,
  coefficient NUMERIC DEFAULT 1,
  note_max NUMERIC DEFAULT 20,
  groupe_id UUID REFERENCES public.groupes(id) ON DELETE CASCADE,
  professeur_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les notes des étudiants
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  evaluation_id UUID NOT NULL REFERENCES public.evaluations(id) ON DELETE CASCADE,
  etudiant_id UUID NOT NULL,
  note NUMERIC,
  commentaire TEXT,
  date_notation TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour les performances
CREATE INDEX idx_evaluations_groupe ON public.evaluations(groupe_id);
CREATE INDEX idx_evaluations_professeur ON public.evaluations(professeur_id);
CREATE INDEX idx_notes_evaluation ON public.notes(evaluation_id);
CREATE INDEX idx_notes_etudiant ON public.notes(etudiant_id);

-- Contrainte unique pour éviter les doublons de notes
ALTER TABLE public.notes ADD CONSTRAINT unique_note_per_student UNIQUE (evaluation_id, etudiant_id);

-- Enable RLS
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Policies for evaluations
CREATE POLICY "Professors can create evaluations"
ON public.evaluations
FOR INSERT
WITH CHECK (auth.uid() = professeur_id);

CREATE POLICY "Professors can update their evaluations"
ON public.evaluations
FOR UPDATE
USING (auth.uid() = professeur_id);

CREATE POLICY "Professors can delete their evaluations"
ON public.evaluations
FOR DELETE
USING (auth.uid() = professeur_id);

CREATE POLICY "Users can view evaluations for their groups"
ON public.evaluations
FOR SELECT
USING (
  auth.uid() = professeur_id
  OR EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.groupe_id = evaluations.groupe_id
    AND gm.etudiant_id = auth.uid()
  )
);

-- Policies for notes
CREATE POLICY "Professors can manage notes"
ON public.notes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.evaluations e
    WHERE e.id = notes.evaluation_id
    AND e.professeur_id = auth.uid()
  )
);

CREATE POLICY "Students can view their own notes"
ON public.notes
FOR SELECT
USING (auth.uid() = etudiant_id);