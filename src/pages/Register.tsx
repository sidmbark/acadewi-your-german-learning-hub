import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Loader2, CheckCircle2, Upload } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useAuth();

  const progress = (step / 3) * 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs requis",
          variant: "destructive",
        });
        return;
      }
    } else if (step === 2) {
      if (!formData.password || formData.password !== formData.confirmPassword) {
        toast({
          title: "Erreur",
          description: "Les mots de passe ne correspondent pas",
          variant: "destructive",
        });
        return;
      }
      if (formData.password.length < 8) {
        toast({
          title: "Erreur",
          description: "Le mot de passe doit contenir au moins 8 caractères",
          variant: "destructive",
        });
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentProof) {
      toast({
        title: "Erreur",
        description: "Veuillez télécharger une preuve de paiement",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      // 1. Create user account
      const { error: signUpError, user: newUser } = await signUp(formData.email, formData.password, {
        nom: formData.lastName,
        prenom: formData.firstName,
        telephone: formData.phone,
        adresse: formData.address,
      });
      
      if (signUpError) {
        toast({
          title: "Erreur d'inscription",
          description: signUpError.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // 2. Upload payment proof to Supabase Storage
      if (newUser) {
        const fileExt = paymentProof.name.split('.').pop();
        const fileName = `${newUser.id}-${Date.now()}.${fileExt}`;
        const filePath = `payment-proofs/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, paymentProof);

        if (uploadError) {
          console.error('Error uploading payment proof:', uploadError);
          toast({
            title: 'Attention',
            description: 'Compte créé mais erreur lors de l\'upload de la preuve de paiement. Veuillez contacter l\'administrateur.',
            variant: 'destructive',
          });
        } else {
          // 3. Get public URL and update profile
          const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ photo_paiement: publicUrl })
            .eq('id', newUser.id);

          if (updateError) {
            console.error('Error updating profile with payment proof:', updateError);
          }
        }
      }

      toast({
        title: "Inscription réussie !",
        description: "Votre compte a été créé. Votre inscription sera validée par un administrateur.",
      });
      
      setIsLoading(false);
      navigate("/login");
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 animate-fade-in-up">
          <Link to="/" className="inline-flex items-center justify-center mb-4">
            <span className="text-4xl font-bold text-gradient-primary">Acadewi</span>
          </Link>
          <p className="text-muted-foreground">Créez votre compte et commencez à apprendre l'allemand</p>
        </div>

        <Card className="border-2 shadow-xl animate-scale-in">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Inscription</CardTitle>
            <CardDescription className="text-center">
              Étape {step} sur 3
            </CardDescription>
            <Progress value={progress} className="h-2" />
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">Informations personnelles</h3>
                    <p className="text-sm text-muted-foreground">Commençons par vos informations de base</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="Jean"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Dupont"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="jean.dupont@exemple.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+212 6 12 34 56 78"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="Votre adresse"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="h-11"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">Sécurité du compte</h3>
                    <p className="text-sm text-muted-foreground">Créez un mot de passe sécurisé</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">Minimum 8 caractères</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="h-11"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">Preuve de paiement</h3>
                    <p className="text-sm text-muted-foreground">Téléchargez votre justificatif de paiement</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentProof">Fichier (JPG, PNG, PDF) *</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                      <input
                        id="paymentProof"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="paymentProof" className="cursor-pointer space-y-2 block">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                        <div>
                          <p className="font-medium">Cliquez pour télécharger</p>
                          <p className="text-sm text-muted-foreground">ou glissez-déposez votre fichier ici</p>
                        </div>
                        {paymentProof && (
                          <div className="flex items-center justify-center gap-2 text-success mt-4">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="font-medium">{paymentProof.name}</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-sm">Récapitulatif</h4>
                    <div className="text-sm space-y-1 text-muted-foreground">
                      <p><span className="font-medium text-foreground">Nom:</span> {formData.firstName} {formData.lastName}</p>
                      <p><span className="font-medium text-foreground">Email:</span> {formData.email}</p>
                      <p><span className="font-medium text-foreground">Téléphone:</span> {formData.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    Retour
                  </Button>
                )}
                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    variant="hero"
                    className={step === 1 ? "w-full" : "flex-1"}
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="success"
                    disabled={isLoading || !paymentProof}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Création du compte...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Créer mon compte
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Vous avez déjà un compte ? </span>
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Se connecter
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

export default Register;
