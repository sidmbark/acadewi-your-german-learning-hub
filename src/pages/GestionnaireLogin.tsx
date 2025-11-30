import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const GestionnaireLogin = () => {
  const [email, setEmail] = useState("admin@acadewi.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRole } = useAuth();

  // Fonction pour créer le compte admin s'il n'existe pas
  const handleCreateAdminAccount = async () => {
    setIsCreatingAdmin(true);
    
    try {
      // Vérifier si le compte existe déjà
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email: 'admin@acadewi.com',
        password: 'admin123',
      });

      if (existingUser.user) {
        toast({
          title: "Compte existant",
          description: "Le compte admin existe déjà. Vous pouvez vous connecter.",
        });
        setIsCreatingAdmin(false);
        return;
      }
    } catch (error) {
      // Le compte n'existe pas, on le crée
    }

    try {
      // Créer le compte admin
      const { data, error } = await supabase.auth.signUp({
        email: 'admin@acadewi.com',
        password: 'admin123',
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nom: 'Admin',
            prenom: 'Gestionnaire',
            telephone: '+212 6 00 00 00 00',
            adresse: 'Acadewi HQ',
          },
        },
      });

      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
        setIsCreatingAdmin(false);
        return;
      }

      // Attendre un peu pour que le trigger s'exécute
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mettre à jour le rôle en gestionnaire
      if (data.user) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: 'gestionnaire' })
          .eq('user_id', data.user.id);

        if (roleError) {
          console.error('Error updating role:', roleError);
        }

        // Mettre à jour le statut du profil
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ statut: 'valide' })
          .eq('id', data.user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }
      }

      toast({
        title: "Compte créé",
        description: "Le compte admin a été créé avec succès. Vous pouvez maintenant vous connecter avec admin@acadewi.com / admin123",
      });

      setEmail('admin@acadewi.com');
      setPassword('admin123');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  useEffect(() => {
    // Si déjà connecté en tant que gestionnaire, rediriger
    if (user && userRole === 'gestionnaire') {
      navigate('/gestionnaire/dashboard');
    }
  }, [user, userRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Vérifier que l'utilisateur est bien un gestionnaire
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      if (roleData?.role !== 'gestionnaire') {
        await supabase.auth.signOut();
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les permissions de gestionnaire",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur le dashboard gestionnaire",
      });
      
      navigate('/gestionnaire/dashboard');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in-up">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <BookOpen className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold text-gradient-primary">Acadewi</span>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Espace Gestionnaire</h2>
          </div>
          <p className="text-muted-foreground">Identifiants : admin@acadewi.com / admin123</p>
        </div>

        <Card className="border-2 shadow-xl animate-scale-in">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Connexion Gestionnaire</CardTitle>
            <CardDescription className="text-center">
              Entrez vos identifiants d'administrateur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email administrateur</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@acadewi.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading || isCreatingAdmin}
                variant="hero"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Se connecter
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleCreateAdminAccount}
                disabled={isLoading || isCreatingAdmin}
              >
                {isCreatingAdmin ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création du compte...
                  </>
                ) : (
                  'Créer le compte admin (première utilisation)'
                )}
              </Button>
            </div>

            <div className="mt-6 text-center text-sm">
              <Link to="/login" className="text-primary font-semibold hover:underline">
                ← Retour à la connexion étudiants
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GestionnaireLogin;
