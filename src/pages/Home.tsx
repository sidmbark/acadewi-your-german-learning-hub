import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Users, Award, Clock, CheckCircle2, Star, ArrowRight, MessageCircle } from "lucide-react";
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
    "Accès complet à la plateforme (valeur 750DH/mois)",
    "Accompagnement personnalisé dès le début",
    "Support direct de notre équipe",
    "50% de réduction au lancement",
  ];

  const whyGerman = [
    {
      icon: BookOpen,
      title: "Universités Gratuites",
      description: "Accédez à l'enseignement supérieur de qualité sans frais de scolarité en Allemagne",
    },
    {
      icon: Award,
      title: "Salaires Compétitifs",
      description: "Profitez d'opportunités professionnelles avec des rémunérations attractives",
    },
    {
      icon: Users,
      title: "Migration Qualifiée",
      description: "Facilitez votre installation avec des programmes dédiés aux professionnels qualifiés",
    },
    {
      icon: Star,
      title: "Qualité de Vie",
      description: "Bénéficiez d'un environnement stable avec une excellente qualité de vie",
    },
  ];

  const formulas = [
    {
      icon: "📍",
      title: "Présentiel",
      description: "Cours en face-à-face dans nos locaux avec interaction directe",
    },
    {
      icon: "💻",
      title: "En Ligne",
      description: "Apprenez depuis chez vous avec des sessions en visioconférence",
    },
    {
      icon: "⚡",
      title: "Intensif",
      description: "Progressez rapidement avec un programme accéléré et intensif",
    },
  ];

  const faqs = [
    {
      question: "Combien de temps dure la formation ?",
      answer: "La durée dépend du niveau visé. Comptez 3 à 6 mois par niveau (A1, A2, B1, B2, C1, C2).",
    },
    {
      question: "Quels sont les modes de paiement acceptés ?",
      answer: "Nous acceptons les virements bancaires. Après inscription, vous devez télécharger votre preuve de paiement.",
    },
    {
      question: "Comment se déroulent les cours en ligne ?",
      answer: "Les cours se font via Zoom avec des sessions interactives, des exercices et un suivi personnalisé.",
    },
    {
      question: "Puis-je changer de formule en cours de formation ?",
      answer: "Oui, contactez notre équipe pour adapter votre formule selon vos besoins.",
    },
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
            <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              FAQ
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

      {/* Why German Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold">
              Pourquoi l'<span className="text-gradient-primary">Allemand</span> ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ouvrez-vous les portes d'un avenir prometteur
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyGerman.map((reason, index) => (
              <Card
                key={index}
                className="border-2 hover:border-primary hover:shadow-lg transition-all duration-300 animate-scale-in group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 space-y-4 text-center">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-secondary to-secondary-light flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <reason.icon className="h-7 w-7 text-secondary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">{reason.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{reason.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ce qui est <span className="text-gradient-secondary">inclus</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Tout ce dont vous avez besoin pour réussir
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-3 group bg-background p-6 rounded-lg border-2 hover:border-primary transition-all"
              >
                <CheckCircle2 className="h-6 w-6 text-success shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-lg">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulas Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Nos <span className="text-gradient-primary">Formules</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Choisissez le mode d'apprentissage qui vous convient
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {formulas.map((formula, index) => (
              <Card
                key={index}
                className="border-2 hover:border-primary hover:shadow-xl transition-all duration-300 group"
              >
                <CardContent className="p-8 space-y-4 text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                    {formula.icon}
                  </div>
                  <h3 className="text-2xl font-bold">{formula.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{formula.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Questions <span className="text-gradient-primary">Fréquentes</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Tout ce que vous devez savoir
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-background border-2 rounded-lg px-6 hover:border-primary transition-colors"
                >
                  <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
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
          <h2 className="text-4xl md:text-5xl font-bold">
            Rejoignez les étudiants qui réussissent avec Acadewi
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Études, travail, migration : nous vous accompagnons vers la réussite en Allemagne
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link to="/register">
                S'inscrire via formulaire <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8 bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <a href="https://wa.me/212" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" />
                Contacter via WhatsApp
              </a>
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
                <li><a href="#faq" className="hover:text-primary transition-colors">FAQ</a></li>
                <li><a href="#testimonials" className="hover:text-primary transition-colors">Témoignages</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ressources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/login" className="hover:text-primary transition-colors">Connexion</Link></li>
                <li><Link to="/register" className="hover:text-primary transition-colors">Inscription</Link></li>
                <li><a href="#" className="hover:text-primary transition-colors">Centre d'aide</a></li>
                <li><Link to="/gestionnaire/login" className="hover:text-primary transition-colors text-xs opacity-50">Espace Gestionnaire</Link></li>
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
