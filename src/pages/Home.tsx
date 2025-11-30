import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, Award, Clock, CheckCircle2, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-learning.jpg";

const Home = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Cours Structurés",
      description: "Apprenez l'allemand avec des cours organisés par niveau (A1 à C2) suivant le CECR",
    },
    {
      icon: Users,
      title: "Groupes Interactifs",
      description: "Rejoignez des groupes d'apprentissage dynamiques avec des professeurs qualifiés",
    },
    {
      icon: Award,
      title: "Certification",
      description: "Obtenez des certificats reconnus à chaque niveau complété",
    },
    {
      icon: Clock,
      title: "Horaires Flexibles",
      description: "Choisissez parmi plusieurs créneaux horaires adaptés à votre emploi du temps",
    },
  ];

  const benefits = [
    "Plateforme intuitive et moderne",
    "Professeurs natifs qualifiés",
    "Exercices interactifs gamifiés",
    "Suivi de progression en temps réel",
    "Documents pédagogiques inclus",
    "Sessions en visioconférence HD",
  ];

  const testimonials = [
    {
      name: "Sophie Martin",
      role: "Étudiante niveau B2",
      comment: "Une plateforme exceptionnelle ! Les cours sont clairs et les professeurs très pédagogues.",
      rating: 5,
    },
    {
      name: "Thomas Dubois",
      role: "Étudiant niveau A2",
      comment: "J'ai progressé rapidement grâce aux exercices interactifs et au suivi personnalisé.",
      rating: 5,
    },
    {
      name: "Marie Lefebvre",
      role: "Étudiante niveau C1",
      comment: "Le meilleur investissement pour maîtriser l'allemand. Interface intuitive et ergonomique.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gradient-primary">Acadewi</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Fonctionnalités
            </a>
            <a href="#benefits" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Avantages
            </a>
            <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Témoignages
            </a>
          </nav>
          <div className="flex gap-3">
            <Button asChild variant="ghost">
              <Link to="/login">Connexion</Link>
            </Button>
            <Button asChild variant="hero">
              <Link to="/register">
                Commencer <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                🎓 Plateforme d'apprentissage de l'allemand
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Maîtrisez l'<span className="text-gradient-primary">allemand</span> avec
                <span className="text-gradient-secondary"> Acadewi</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Rejoignez une plateforme moderne et ergonomique conçue pour vous faire progresser rapidement.
                Cours structurés, exercices interactifs et suivi personnalisé.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" variant="hero" className="text-lg px-8">
                  <Link to="/register">
                    Démarrer gratuitement <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg px-8">
                  <Link to="/login">Connexion</Link>
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-background"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-semibold text-foreground">500+ étudiants</span> nous font confiance
                  </p>
                </div>
              </div>
            </div>
            <div className="relative animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl" />
              <img
                src={heroImage}
                alt="Étudiants apprenant l'allemand"
                className="relative rounded-2xl shadow-2xl w-full h-auto animate-float"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold">
              Une plateforme <span className="text-gradient-primary">complète</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour apprendre l'allemand efficacement
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-2 hover:border-primary hover:shadow-lg transition-all duration-300 animate-scale-in group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center group-hover:scale-110 transition-transform">
                    <feature.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl font-bold">
                Pourquoi choisir <span className="text-gradient-secondary">Acadewi</span> ?
              </h2>
              <p className="text-lg text-muted-foreground">
                Notre plateforme a été conçue avec une attention particulière à l'ergonomie et à l'expérience
                utilisateur pour maximiser votre apprentissage.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 group">
                    <CheckCircle2 className="h-6 w-6 text-success shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
              <Button asChild size="lg" variant="secondary" className="mt-6">
                <Link to="/register">
                  Rejoindre Acadewi <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-primary/20 blur-3xl" />
              <Card className="relative p-8 border-2 shadow-xl">
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-success to-success-light flex items-center justify-center">
                        <Award className="h-8 w-8 text-success-foreground" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold">500+</div>
                        <div className="text-muted-foreground">Étudiants actifs</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold">1200+</div>
                        <div className="text-muted-foreground">Heures de cours</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-secondary-light flex items-center justify-center">
                        <Users className="h-8 w-8 text-secondary-foreground" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold">15+</div>
                        <div className="text-muted-foreground">Professeurs qualifiés</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ce que disent nos <span className="text-gradient-primary">étudiants</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Rejoignez des centaines d'apprenants satisfaits
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2 hover:shadow-lg transition-all">
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.comment}"</p>
                  <div className="pt-4 border-t">
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-dark text-primary-foreground">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">Prêt à commencer votre voyage ?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Inscrivez-vous maintenant et accédez à tous nos cours d'allemand. Première semaine gratuite !
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link to="/register">
                S'inscrire maintenant <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link to="/login">J'ai déjà un compte</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-gradient-primary">Acadewi</span>
              </div>
              <p className="text-sm text-muted-foreground">
                La plateforme moderne pour apprendre l'allemand efficacement.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Fonctionnalités</a></li>
                <li><a href="#benefits" className="hover:text-primary transition-colors">Avantages</a></li>
                <li><a href="#testimonials" className="hover:text-primary transition-colors">Témoignages</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ressources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/login" className="hover:text-primary transition-colors">Connexion</Link></li>
                <li><Link to="/register" className="hover:text-primary transition-colors">Inscription</Link></li>
                <li><a href="#" className="hover:text-primary transition-colors">Centre d'aide</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>contact@acadewi.com</li>
                <li>+33 1 23 45 67 89</li>
                <li>Paris, France</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Acadewi. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
