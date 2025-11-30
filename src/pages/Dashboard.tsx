import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Calendar, FileText, TrendingUp, Clock, Download } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Cours {
  id: string;
  titre: string;
  description: string;
  date: string;
  heure: string;
  lien_zoom: string;
  groupes: {
    nom: string;
    niveau: string;
  };
}

interface Exercice {
  id: string;
  titre: string;
  type: string;
  duree: number;
}

interface Progression {
  score: number;
  tentatives: number;
}

interface Document {
  id: string;
  titre: string;
  fichier_url: string;
  type: string;
  date_upload: string;
  cours: {
    titre: string;
  } | null;
}

const Dashboard = () => {
  const { user, userRole, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [nextCours, setNextCours] = useState<Cours | null>(null);
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [groupeInfo, setGroupeInfo] = useState<{ nom: string; niveau: string } | null>(null);
  const [stats, setStats] = useState({
    coursCount: 0,
    exercicesCompleted: 0,
    heuresApprentissage: 0,
    progressionMoyenne: 0,
  });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }

    if (!loading && userRole) {
      if (userRole === 'professeur') {
        navigate('/prof/dashboard');
      } else if (userRole === 'gestionnaire') {
        navigate('/gestionnaire/dashboard');
      }
    }

    if (user && userRole === 'etudiant') {
      fetchDashboardData();
    }
  }, [user, userRole, loading, navigate]);

  const fetchDashboardData = async () => {
    try {
      // Récupérer le groupe de l'étudiant
      const { data: groupMember } = await supabase
        .from('group_members')
        .select('groupe_id')
        .eq('etudiant_id', user?.id)
        .single();

      if (!groupMember) {
        setLoadingData(false);
        return;
      }
      
      // Get group info
      const { data: groupData } = await supabase
        .from('groupes')
        .select('nom, niveau')
        .eq('id', groupMember.groupe_id)
        .single();
        
      if (groupData) {
        setGroupeInfo(groupData);
      }

      // Récupérer le prochain cours (futur uniquement)
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      const { data: coursData } = await supabase
        .from('cours')
        .select(`
          *,
          groupes(nom, niveau)
        `)
        .eq('groupe_id', groupMember.groupe_id)
        .gte('date', today)
        .order('date', { ascending: true })
        .order('heure', { ascending: true });

      // Filter out past courses for today
      const futureCours = coursData?.filter(c => {
        const coursDateTime = new Date(`${c.date}T${c.heure}`);
        return coursDateTime.getTime() > now.getTime();
      });

      if (futureCours && futureCours.length > 0) {
        setNextCours(futureCours[0] as Cours);
      }

      // Récupérer les exercices du groupe
      const { data: exercicesData } = await supabase
        .from('exercices')
        .select('*')
        .eq('groupe_id', groupMember.groupe_id)
        .limit(3);

      setExercices(exercicesData || []);

      // Récupérer les documents disponibles
      const { data: documentsData } = await supabase
        .from('documents')
        .select(`
          *,
          cours(titre)
        `)
        .order('date_upload', { ascending: false })
        .limit(5);

      setDocuments(documentsData || []);

      // Calculer les statistiques
      // Compter les cours suivis
      const { count: coursCount } = await supabase
        .from('presences')
        .select('*', { count: 'exact', head: true })
        .eq('etudiant_id', user?.id)
        .eq('present', true);

      // Compter les exercices complétés
      const { count: exercicesCompleted } = await supabase
        .from('progression')
        .select('*', { count: 'exact', head: true })
        .eq('etudiant_id', user?.id);

      // Calculer la progression moyenne
      const { data: progressionData } = await supabase
        .from('progression')
        .select('score')
        .eq('etudiant_id', user?.id);

      let progressionMoyenne = 0;
      if (progressionData && progressionData.length > 0) {
        const total = progressionData.reduce((acc, p) => acc + (Number(p.score) || 0), 0);
        progressionMoyenne = Math.round(total / progressionData.length);
      }

      // Calculer les heures d'apprentissage (estimation basée sur les présences)
      const heuresApprentissage = (coursCount || 0) * 2; // Estimation de 2h par cours

      setStats({
        coursCount: coursCount || 0,
        exercicesCompleted: exercicesCompleted || 0,
        heuresApprentissage,
        progressionMoyenne,
      });

      setLoadingData(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données du tableau de bord',
        variant: 'destructive',
      });
      setLoadingData(false);
    }
  };

  const canJoinCours = (coursDate: string, coursHeure: string) => {
    const now = new Date();
    const coursDateTime = new Date(`${coursDate}T${coursHeure}`);
    const diffMinutes = (coursDateTime.getTime() - now.getTime()) / (1000 * 60);
    
    return diffMinutes <= 30 && diffMinutes >= -60;
  };

  const getTimeUntilCours = (coursDate: string, coursHeure: string) => {
    const now = new Date();
    const coursDateTime = new Date(`${coursDate}T${coursHeure}`);
    const diffMinutes = (coursDateTime.getTime() - now.getTime()) / (1000 * 60);
    
    if (diffMinutes < 0) {
      return 'En cours';
    } else if (diffMinutes < 60) {
      return `Dans ${Math.round(diffMinutes)}min`;
    } else if (diffMinutes < 1440) {
      return `Dans ${Math.round(diffMinutes / 60)}h`;
    } else {
      return `Dans ${Math.round(diffMinutes / 1440)} jours`;
    }
  };

  const handleJoinZoom = (lienZoom: string) => {
    window.open(lienZoom, '_blank', 'width=1200,height=800');
  };

  if (loading || loadingData) {
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
          {groupeInfo && (
            <div className="mt-3">
              <Badge className="bg-primary text-primary-foreground text-sm">
                Groupe: {groupeInfo.nom} - {groupeInfo.niveau}
              </Badge>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cours suivis</p>
                  <p className="text-3xl font-bold mt-1">{stats.coursCount}</p>
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
                  <p className="text-3xl font-bold mt-1">{stats.exercicesCompleted}</p>
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
                  <p className="text-3xl font-bold mt-1">{stats.heuresApprentissage}</p>
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
                  <p className="text-3xl font-bold mt-1">{stats.progressionMoyenne}%</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-warning to-warning flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-warning-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Prochain cours */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Prochain cours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {nextCours ? (
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 border-l-4 border-primary">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{nextCours.titre}</h3>
                    <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-semibold">
                      {getTimeUntilCours(nextCours.date, nextCours.heure)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{nextCours.description || 'Pas de description'}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <p className="text-muted-foreground">
                        Groupe: <span className="font-medium text-foreground">{nextCours.groupes?.nom} - {nextCours.groupes?.niveau}</span>
                      </p>
                      <p className="text-muted-foreground">
                        Horaire: <span className="font-medium text-foreground">
                          {new Date(nextCours.date).toLocaleDateString('fr-FR')} à {nextCours.heure}
                        </span>
                      </p>
                    </div>
                    {canJoinCours(nextCours.date, nextCours.heure) ? (
                      <Button 
                        variant="hero" 
                        size="sm"
                        onClick={() => handleJoinZoom(nextCours.lien_zoom)}
                      >
                        Rejoindre
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        Bientôt disponible
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Aucun cours planifié pour le moment
                </p>
              )}
            </CardContent>
          </Card>

          {/* Exercices en attente */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-secondary" />
                Exercices disponibles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {exercices.length > 0 ? (
                exercices.map((exercise) => (
                  <div key={exercise.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{exercise.titre}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">{exercise.type}</span>
                        {exercise.duree && (
                          <span className="text-xs text-muted-foreground">{exercise.duree} min</span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Commencer
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Aucun exercice disponible pour le moment
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Documents disponibles */}
        <Card className="border-2 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Documents disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length > 0 ? (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{doc.titre}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground">{doc.type}</span>
                          {doc.cours && (
                            <span className="text-xs text-muted-foreground">• {doc.cours.titre}</span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            • {new Date(doc.date_upload).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(doc.fichier_url, '_blank')}
                    >
                      Télécharger
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Aucun document disponible pour le moment
              </p>
            )}
          </CardContent>
        </Card>

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
            <Button variant="outline" className="h-20 justify-start gap-4">
              <FileText className="h-6 w-6" />
              <div className="text-left">
                <div className="font-semibold">Exercices</div>
                <div className="text-xs text-muted-foreground">Bibliothèque complète</div>
              </div>
            </Button>
            <Button variant="outline" className="h-20 justify-start gap-4">
              <TrendingUp className="h-6 w-6" />
              <div className="text-left">
                <div className="font-semibold">Progression</div>
                <div className="text-xs text-muted-foreground">Suivre vos résultats</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
