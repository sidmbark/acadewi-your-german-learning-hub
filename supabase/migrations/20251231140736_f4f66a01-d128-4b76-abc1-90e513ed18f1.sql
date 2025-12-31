-- Table pour stocker les badges disponibles
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  description TEXT NOT NULL,
  icone TEXT NOT NULL,
  condition_type TEXT NOT NULL, -- 'cours_suivis', 'exercices_completes', 'streak', 'note_parfaite', etc.
  condition_value INTEGER NOT NULL, -- valeur requise pour débloquer
  xp_reward INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les badges débloqués par les étudiants
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  date_obtention TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Table pour les points XP et statistiques de gamification
CREATE TABLE public.user_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  xp_total INTEGER NOT NULL DEFAULT 0,
  niveau INTEGER NOT NULL DEFAULT 1,
  streak_actuel INTEGER NOT NULL DEFAULT 0,
  meilleur_streak INTEGER NOT NULL DEFAULT 0,
  derniere_activite DATE,
  cours_suivis INTEGER NOT NULL DEFAULT 0,
  exercices_completes INTEGER NOT NULL DEFAULT 0,
  notes_parfaites INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour l'historique des activités XP
CREATE TABLE public.xp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  xp_gagne INTEGER NOT NULL,
  raison TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_history ENABLE ROW LEVEL SECURITY;

-- Policies pour badges (lecture publique)
CREATE POLICY "Everyone can view badges" ON public.badges
FOR SELECT USING (true);

CREATE POLICY "Gestionnaires can manage badges" ON public.badges
FOR ALL USING (has_role(auth.uid(), 'gestionnaire'));

-- Policies pour user_badges
CREATE POLICY "Users can view their own badges" ON public.user_badges
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Professeurs can view all user badges" ON public.user_badges
FOR SELECT USING (has_role(auth.uid(), 'professeur'));

CREATE POLICY "System can insert user badges" ON public.user_badges
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policies pour user_gamification
CREATE POLICY "Users can view their own gamification" ON public.user_gamification
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own gamification" ON public.user_gamification
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own gamification" ON public.user_gamification
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Professeurs can view all gamification" ON public.user_gamification
FOR SELECT USING (has_role(auth.uid(), 'professeur'));

-- Policies pour xp_history
CREATE POLICY "Users can view their own xp history" ON public.xp_history
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own xp history" ON public.xp_history
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Insérer les badges par défaut
INSERT INTO public.badges (nom, description, icone, condition_type, condition_value, xp_reward) VALUES
('Premier Pas', 'Assistez à votre premier cours', 'footprints', 'cours_suivis', 1, 50),
('Assidu', 'Assistez à 10 cours', 'calendar-check', 'cours_suivis', 10, 100),
('Marathonien', 'Assistez à 50 cours', 'trophy', 'cours_suivis', 50, 500),
('Curieux', 'Complétez votre premier exercice', 'lightbulb', 'exercices_completes', 1, 50),
('Travailleur', 'Complétez 10 exercices', 'brain', 'exercices_completes', 10, 150),
('Expert', 'Complétez 50 exercices', 'graduation-cap', 'exercices_completes', 50, 500),
('Flamme', 'Streak de 3 jours consécutifs', 'flame', 'streak', 3, 75),
('Feu Ardent', 'Streak de 7 jours consécutifs', 'fire', 'streak', 7, 200),
('Inarrêtable', 'Streak de 30 jours consécutifs', 'zap', 'streak', 30, 1000),
('Perfectionniste', 'Obtenez une note parfaite', 'star', 'note_parfaite', 1, 100),
('Génie', 'Obtenez 5 notes parfaites', 'sparkles', 'note_parfaite', 5, 300);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_user_gamification_updated_at
BEFORE UPDATE ON public.user_gamification
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Activer realtime pour les mises à jour en temps réel
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_gamification;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_badges;