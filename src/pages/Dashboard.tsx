import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Calendar, FileText, TrendingUp, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { user, userRole, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      navigate('/login');
      return;
    }

    // Redirect based on role
    if (!loading && userRole) {
      if (userRole === 'professeur') {
        navigate('/prof/dashboard');
      } else if (userRole === 'gestionnaire') {
        navigate('/gestionnaire/dashboard');
      }
    }
  }, [user, userRole, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || userRole !== 'etudiant') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gradient-primary">Acadewi</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Bienvenue, <span className="font-semibold text-foreground">{user?.email}</span></span>
            <Button variant="outline" onClick={signOut}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Tableau de bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre espace d'apprentissage</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cours suivis</p>
                  <p className="text-3xl font-bold mt-1">12</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Exercices complétés</p>
                  <p className="text-3xl font-bold mt-1">48</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-success to-success-light flex items-center justify-center">
                  <FileText className="h-6 w-6 text-success-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Heures d'apprentissage</p>
                  <p className="text-3xl font-bold mt-1">87</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-secondary-light flex items-center justify-center">
                  <Clock className="h-6 w-6 text-secondary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Progression</p>
                  <p className="text-3xl font-bold mt-1">78%</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-warning to-warning flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-warning-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Prochain cours */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Prochain cours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 border-l-4 border-primary">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">Allemand Niveau B1</h3>
                  <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-semibold">
                    Dans 2h
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Grammaire avancée et conversation</p>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Professeur: <span className="font-medium text-foreground">Dr. Schmidt</span></p>
                    <p className="text-muted-foreground">Horaire: <span className="font-medium text-foreground">14:00 - 16:00</span></p>
                  </div>
                  <Button variant="hero" size="sm">
                    Rejoindre
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exercices en attente */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-secondary" />
                Exercices en attente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: "Conjugaison des verbes irréguliers", dueDate: "Aujourd'hui", difficulty: "Moyen" },
                { title: "Compréhension écrite - Article", dueDate: "Demain", difficulty: "Facile" },
                { title: "Expression orale - Débat", dueDate: "Dans 3 jours", difficulty: "Difficile" },
              ].map((exercise, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{exercise.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">{exercise.dueDate}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        exercise.difficulty === "Facile" ? "bg-success/20 text-success" :
                        exercise.difficulty === "Moyen" ? "bg-warning/20 text-warning" :
                        "bg-destructive/20 text-destructive"
                      }`}>
                        {exercise.difficulty}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Commencer
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Actions rapides</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 justify-start gap-4" asChild>
              <Link to="/planning">
                <Calendar className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Planning</div>
                  <div className="text-xs text-muted-foreground">Voir tous les cours</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 justify-start gap-4" asChild>
              <Link to="/exercises">
                <FileText className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Exercices</div>
                  <div className="text-xs text-muted-foreground">Bibliothèque complète</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 justify-start gap-4" asChild>
              <Link to="/progression">
                <TrendingUp className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Progression</div>
                  <div className="text-xs text-muted-foreground">Suivre vos résultats</div>
                </div>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
