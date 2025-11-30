import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Eye, EyeOff, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const ProfLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signOut, user, userRole } = useAuth();

  useEffect(() => {
    // Only redirect professors who are already logged in
    if (user && userRole === 'professeur') {
      navigate('/prof/dashboard');
    }
  }, [user, userRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If user is already logged in as another role, show warning
    if (user && userRole && userRole !== 'professeur') {
      toast({
        title: "Déconnexion requise",
        description: "Vous devez d'abord vous déconnecter de votre compte actuel",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Erreur de connexion",
        description: error.message === "Invalid login credentials" 
          ? "Email ou mot de passe incorrect" 
          : error.message,
        variant: "destructive",
      });
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
          <p className="text-muted-foreground">Espace Professeur</p>
        </div>

        <Card className="border-2 shadow-xl animate-scale-in">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Connexion Professeur</CardTitle>
            <CardDescription className="text-center">
              Entrez vos identifiants pour accéder à votre espace
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user && userRole && userRole !== 'professeur' && (
              <div className="mb-4 p-4 bg-warning/10 border border-warning/30 rounded-lg space-y-3">
                <p className="text-sm text-warning-foreground">
                  Vous êtes déjà connecté en tant que <strong>{userRole}</strong>.
                </p>
                <Button 
                  onClick={() => signOut()}
                  variant="outline"
                  className="w-full"
                  type="button"
                >
                  Se déconnecter
                </Button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre.email@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
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
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                variant="hero"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Vous n'avez pas de compte ?{" "}
                <Link to="/prof/register" className="text-primary hover:underline font-medium">
                  S'inscrire
                </Link>
              </div>
            </form>
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

export default ProfLogin;
