import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Users, Award, Clock, CheckCircle2, Star, ArrowRight, MessageCircle, Sparkles, Brain, TrendingUp, Mail, Phone, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
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
      name: "Amina El Fassi",
      role: "Étudiante niveau B2",
      comment: "Une plateforme exceptionnelle ! Les cours sont clairs et les professeurs très pédagogues. Je recommande vivement.",
      rating: 5,
    },
    {
      name: "Youssef Bennani",
      role: "Étudiant niveau A2",
      comment: "J'ai progressé rapidement grâce aux exercices interactifs et au suivi personnalisé. Acadewi a transformé mon apprentissage.",
      rating: 5,
    },
    {
      name: "Salma Alaoui",
      role: "Étudiante niveau C1",
      comment: "Le meilleur investissement pour maîtriser l'allemand. Interface moderne et suivi efficace. Je prépare maintenant mon départ en Allemagne.",
      rating: 5,
    },
  ];

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Message envoyé avec succès ! Nous vous recontacterons bientôt.");
    setContactForm({ name: "", email: "", phone: "", message: "" });
    setIsSubmitting(false);
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent("Bonjour, je souhaite obtenir plus d'informations sur les cours d'allemand chez Acadewi.");
    window.open(`https://wa.me/212600000000?text=${message}`, "_blank");
  };

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
                🎓 Learn German A1-B2 in Morocco
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Master <span className="text-gradient-primary">German</span> with
                <span className="text-gradient-secondary"> Acadewi</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Live classes + Expert teachers + Goethe certification
              </p>
              <div className="flex flex-wrap gap-4 text-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span>Live Interactive Classes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span>Expert Native Teachers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span>Goethe Certification Prep</span>
                </div>
              </div>
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

      {/* Course Overview Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold">
              A1 Course <span className="text-gradient-primary">Details</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your journey to German proficiency starts here
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-primary/20 hover:border-primary hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <div className="text-5xl font-bold text-gradient-primary mb-2">€75</div>
                      <div className="text-muted-foreground">per month</div>
                      <div className="text-sm text-muted-foreground mt-1">€225 total for 13 weeks</div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-primary shrink-0 mt-1" />
                        <div>
                          <div className="font-semibold">Schedule</div>
                          <div className="text-sm text-muted-foreground">18:00 - 19:30</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <BookOpen className="h-5 w-5 text-primary shrink-0 mt-1" />
                        <div>
                          <div className="font-semibold">Class Days</div>
                          <div className="text-sm text-muted-foreground">Mon, Tue, Wed + Fri (Sprechen)</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Award className="h-5 w-5 text-primary shrink-0 mt-1" />
                        <div>
                          <div className="font-semibold">Duration</div>
                          <div className="text-sm text-muted-foreground">13 weeks intensive program</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-primary/5 rounded-lg p-6 border border-primary/10">
                      <div className="text-2xl font-bold mb-4">What's Included</div>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                          <span>52 live interactive sessions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                          <span>Extra speaking practice (Sprechen)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                          <span>All course materials included</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                          <span>Personal progress tracking</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                          <span>Goethe exam preparation</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-secondary/10 rounded-lg p-4 border border-secondary/20">
                      <div className="flex items-center gap-2 text-secondary font-semibold">
                        <Star className="h-5 w-5 fill-secondary" />
                        <span>Starts December 15, 2025</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-8 border-t">
                  <Button asChild size="lg" variant="hero" className="w-full text-lg">
                    <Link to="/register">
                      Enroll Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold">
              How <span className="text-gradient-primary">It Works</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your path to German fluency in 5 simple steps
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                step: "01",
                title: "Register & Choose Your Level",
                description: "Create your account and take our placement test to find the perfect starting point for your German journey.",
              },
              {
                step: "02",
                title: "Meet Your Teacher",
                description: "Get introduced to your expert native German teacher and your learning group.",
              },
              {
                step: "03",
                title: "Join Live Classes",
                description: "Attend interactive sessions 4 times per week. Practice speaking, listening, and grammar with real-time feedback.",
              },
              {
                step: "04",
                title: "Practice & Progress",
                description: "Complete exercises, track your progress, and receive personalized feedback throughout the course.",
              },
              {
                step: "05",
                title: "Get Certified",
                description: "Prepare for and pass the Goethe certification exam with confidence.",
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="border-2 hover:border-primary hover:shadow-lg transition-all duration-300 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 flex gap-6">
                  <div className="text-6xl font-bold text-gradient-primary opacity-20 group-hover:opacity-100 transition-opacity">
                    {item.step}
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-2xl font-bold">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Teacher Introduction Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold">
              Meet Your <span className="text-gradient-primary">Teacher</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn from experienced, passionate educators
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Card className="border-2 border-primary/20 hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-5xl font-bold text-white shrink-0">
                    Y
                  </div>
                  
                  <div className="flex-1 text-center md:text-left space-y-4">
                    <div>
                      <h3 className="text-3xl font-bold">Youssef Bennani</h3>
                      <p className="text-muted-foreground text-lg">Senior German Instructor</p>
                    </div>
                    
                    <p className="text-muted-foreground leading-relaxed">
                      Native German speaker with over 8 years of teaching experience. Youssef holds a Master's degree in German Language 
                      and Literature from Goethe University Frankfurt. He has successfully prepared hundreds of students for Goethe 
                      certifications from A1 to C2 levels. His teaching philosophy focuses on practical communication skills while 
                      maintaining strong grammatical foundations.
                    </p>
                    
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                        Goethe Certified
                      </div>
                      <div className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-semibold">
                        8+ Years Experience
                      </div>
                      <div className="px-3 py-1 bg-success/10 text-success rounded-full text-sm font-semibold">
                        500+ Students
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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

      {/* AI Innovation Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 space-y-4 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
              <Sparkles className="h-4 w-4" />
              Bientôt disponible
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              L'<span className="text-gradient-primary">Intelligence Artificielle</span> au service de votre apprentissage
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Une première au Maroc ! Nous intégrons prochainement l'IA pour révolutionner votre expérience d'apprentissage
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 border-primary/20 hover:border-primary hover:shadow-xl transition-all duration-300 group bg-background/80 backdrop-blur">
              <CardContent className="p-8 space-y-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Brain className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold">Assistant IA Personnalisé</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Un tuteur virtuel disponible 24/7 pour répondre à vos questions et vous guider dans votre apprentissage
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-secondary/20 hover:border-secondary hover:shadow-xl transition-all duration-300 group bg-background/80 backdrop-blur">
              <CardContent className="p-8 space-y-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-secondary-light flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-8 w-8 text-secondary-foreground" />
                </div>
                <h3 className="text-2xl font-bold">Suivi Intelligent</h3>
                <p className="text-muted-foreground leading-relaxed">
                  L'IA analyse votre progression et adapte automatiquement le contenu à votre rythme et vos besoins
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-primary/20 hover:border-primary hover:shadow-xl transition-all duration-300 group bg-background/80 backdrop-blur">
              <CardContent className="p-8 space-y-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Sparkles className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold">Correction Instantanée</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Recevez des feedbacks immédiats et détaillés sur vos exercices avec des explications personnalisées
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-lg text-muted-foreground italic">
              🇲🇦 Premier centre d'apprentissage de l'allemand au Maroc à intégrer l'IA dans sa pédagogie
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Transparency Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold">
              Transparent <span className="text-gradient-primary">Pricing</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              No hidden fees. No surprises. Just quality education.
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <Card className="border-2 border-primary/20 hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <div className="text-6xl md:text-7xl font-bold text-gradient-primary mb-4">
                    €75<span className="text-2xl text-muted-foreground">/month</span>
                  </div>
                  <p className="text-xl text-muted-foreground">or €225 for the complete A1 course</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold mb-4">What You Pay For</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <span>52 live interactive classes (13 weeks)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <span>Extra speaking sessions every Friday</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <span>All digital course materials</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <span>Access to exercise library</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <span>Progress tracking dashboard</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold mb-4">What's Free</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <span>Platform access & account</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <span>Placement test</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <span>Study resources & tips</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <span>Community support</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <span>Certificate upon completion</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-secondary/10 rounded-lg p-6 border border-secondary/20 text-center">
                  <p className="text-lg mb-4">
                    <strong>Compare:</strong> Traditional language schools charge €800-1200 for similar courses
                  </p>
                  <p className="text-muted-foreground">
                    With Acadewi, you get the same quality education at a fraction of the cost, with the added flexibility of online learning.
                  </p>
                </div>
              </CardContent>
            </Card>
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

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Contactez-<span className="text-gradient-primary">nous</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Une question ? Besoin de plus d'informations ? Nous sommes là pour vous aider
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact Form */}
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-8">
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Nom complet *
                    </label>
                    <Input
                      id="name"
                      placeholder="Votre nom"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre.email@exemple.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Téléphone
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+212 6XX XXX XXX"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Décrivez-nous votre projet d'apprentissage..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      required
                      rows={5}
                      className="resize-none"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Envoi en cours..." : (
                      <>
                        Envoyer le message <Send className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {/* WhatsApp Contact */}
            <div className="space-y-8">
              <Card className="border-2 border-success/20 hover:border-success hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-success/5 to-success/10">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-success flex items-center justify-center">
                      <MessageCircle className="h-8 w-8 text-success-foreground" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Contact WhatsApp</h3>
                      <p className="text-muted-foreground">Réponse rapide garantie</p>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    Préférez une conversation directe ? Contactez-nous sur WhatsApp pour une réponse immédiate à toutes vos questions.
                  </p>
                  
                  <Button
                    onClick={handleWhatsAppContact}
                    size="lg"
                    className="w-full text-lg bg-success hover:bg-success/90"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Discuter sur WhatsApp
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="border-2">
                <CardContent className="p-8 space-y-4">
                  <h3 className="text-xl font-bold">Autres moyens de contact</h3>
                  
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a href="mailto:contact@acadewi.com" className="text-muted-foreground hover:text-primary transition-colors">
                        contact@acadewi.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Téléphone</p>
                      <a href="tel:+212600000000" className="text-muted-foreground hover:text-primary transition-colors">
                        +212 6XX XXX XXX
                      </a>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      <strong>Horaires :</strong> Lun-Ven : 9h-18h | Sam : 10h-16h
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary-dark to-secondary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-grid-pattern" />
        </div>
        <div className="container mx-auto px-4 text-center space-y-8 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold animate-fade-in-up">
            Rejoignez les étudiants qui réussissent avec Acadewi
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Études, travail, migration : nous vous accompagnons vers la réussite en Allemagne
          </p>
          <div className="flex flex-wrap gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 shadow-xl hover:scale-105 transition-transform">
              <Link to="/register">
                S'inscrire maintenant <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              onClick={handleWhatsAppContact}
              size="lg"
              variant="outline"
              className="text-lg px-8 bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary shadow-xl hover:scale-105 transition-transform"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Contacter via WhatsApp
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
