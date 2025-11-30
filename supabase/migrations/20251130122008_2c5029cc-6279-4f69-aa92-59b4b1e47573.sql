-- Create role enum
CREATE TYPE public.app_role AS ENUM ('etudiant', 'professeur', 'gestionnaire');

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom text NOT NULL,
  prenom text NOT NULL,
  telephone text,
  adresse text,
  photo_paiement text,
  statut text DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'valide', 'refuse')),
  date_inscription timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create user_roles table for security
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create groupes table
CREATE TABLE public.groupes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  niveau text NOT NULL CHECK (niveau IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  professeur_id uuid REFERENCES auth.users(id),
  horaire text,
  couleur text DEFAULT '#2563eb',
  created_at timestamp with time zone DEFAULT now()
);

-- Create cours table with Zoom integration
CREATE TABLE public.cours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  description text,
  date date NOT NULL,
  heure time NOT NULL,
  lien_zoom text NOT NULL,
  groupe_id uuid REFERENCES public.groupes(id) ON DELETE CASCADE,
  professeur_id uuid REFERENCES auth.users(id),
  statut text DEFAULT 'planifie' CHECK (statut IN ('planifie', 'en_cours', 'termine', 'annule')),
  created_at timestamp with time zone DEFAULT now()
);

-- Create documents table
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  type text,
  fichier_url text NOT NULL,
  cours_id uuid REFERENCES public.cours(id) ON DELETE CASCADE,
  taille integer,
  date_upload timestamp with time zone DEFAULT now()
);

-- Create exercices table
CREATE TABLE public.exercices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  type text NOT NULL CHECK (type IN ('qcm', 'vrai_faux', 'texte_trous')),
  questions jsonb NOT NULL,
  groupe_id uuid REFERENCES public.groupes(id) ON DELETE CASCADE,
  duree integer,
  date_creation timestamp with time zone DEFAULT now()
);

-- Create progression table
CREATE TABLE public.progression (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  etudiant_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  exercice_id uuid REFERENCES public.exercices(id) ON DELETE CASCADE,
  score numeric(5,2),
  tentatives integer DEFAULT 1,
  date_completion timestamp with time zone DEFAULT now()
);

-- Create presences table
CREATE TABLE public.presences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  etudiant_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  cours_id uuid REFERENCES public.cours(id) ON DELETE CASCADE,
  present boolean DEFAULT false,
  date timestamp with time zone DEFAULT now(),
  UNIQUE (etudiant_id, cours_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  type text NOT NULL,
  lu boolean DEFAULT false,
  date timestamp with time zone DEFAULT now()
);

-- Create group_members table to link students to groups
CREATE TABLE public.group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  groupe_id uuid REFERENCES public.groupes(id) ON DELETE CASCADE,
  etudiant_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date_assignation timestamp with time zone DEFAULT now(),
  UNIQUE (groupe_id, etudiant_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groupes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Gestionnaires can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'gestionnaire'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Gestionnaires can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'gestionnaire'));

-- RLS Policies for groupes
CREATE POLICY "Everyone can view groupes"
  ON public.groupes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Gestionnaires can manage groupes"
  ON public.groupes FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'gestionnaire'));

-- RLS Policies for cours
CREATE POLICY "Everyone can view cours"
  ON public.cours FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Professeurs can manage their cours"
  ON public.cours FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'professeur') 
    AND (professeur_id = auth.uid() OR professeur_id IS NULL)
  );

CREATE POLICY "Gestionnaires can manage all cours"
  ON public.cours FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'gestionnaire'));

-- RLS Policies for documents
CREATE POLICY "Everyone can view documents"
  ON public.documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Professeurs can manage documents"
  ON public.documents FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'professeur'));

-- RLS Policies for exercices
CREATE POLICY "Everyone can view exercices"
  ON public.exercices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Professeurs can manage exercices"
  ON public.exercices FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'professeur'));

-- RLS Policies for progression
CREATE POLICY "Users can view own progression"
  ON public.progression FOR SELECT
  TO authenticated
  USING (etudiant_id = auth.uid());

CREATE POLICY "Users can insert own progression"
  ON public.progression FOR INSERT
  TO authenticated
  WITH CHECK (etudiant_id = auth.uid());

CREATE POLICY "Professeurs can view all progression"
  ON public.progression FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'professeur'));

-- RLS Policies for presences
CREATE POLICY "Everyone can view presences"
  ON public.presences FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Professeurs can manage presences"
  ON public.presences FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'professeur'));

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for group_members
CREATE POLICY "Everyone can view group members"
  ON public.group_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Gestionnaires can manage group members"
  ON public.group_members FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'gestionnaire'));

-- Create trigger for profile updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nom, prenom, telephone, adresse)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom', ''),
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    COALESCE(NEW.raw_user_meta_data->>'telephone', ''),
    COALESCE(NEW.raw_user_meta_data->>'adresse', '')
  );
  
  -- Assign default role as etudiant
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'etudiant');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();