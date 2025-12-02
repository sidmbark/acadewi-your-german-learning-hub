import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, Video, Users, LogOut, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Planning() {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const [cours, setCours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myGroupe, setMyGroupe] = useState<any>(null);

  useEffect(() => {
    if (user && userRole === 'etudiant') {
      fetchCours();
    }
  }, [user, userRole]);

  const fetchCours = async () => {
    try {
      // Get student's group
      const { data: groupMember } = await supabase
        .from('group_members')
        .select('groupe_id, groupes(*)')
        .eq('etudiant_id', user?.id)
        .single();

      if (groupMember) {
        setMyGroupe(groupMember.groupes);

        // Fetch cours for this group (include yesterday)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        const { data: coursData } = await supabase
          .from('cours')
          .select(`
            *,
            groupes(nom, niveau),
            profiles!cours_professeur_id_fkey(nom, prenom)
          `)
          .eq('groupe_id', groupMember.groupe_id)
          .gte('date', yesterdayStr)
          .order('date', { ascending: true })
          .order('heure', { ascending: true });

        setCours(coursData || []);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cours:', error);
      setLoading(false);
    }
  };

  const canJoinCours = (coursDate: string, coursHeure: string) => {
    const now = new Date();
    const coursDateTime = new Date(`${coursDate}T${coursHeure}`);
    const diffMinutes = (coursDateTime.getTime() - now.getTime()) / (1000 * 60);
    
    // Can join 30 minutes before the course
    return diffMinutes <= 30 && diffMinutes >= -60;
  };

  const handleJoinZoom = (lienZoom: string) => {
    window.open(lienZoom, '_blank', 'width=1200,height=800');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Planning des Cours</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <Home className="mr-2 h-4 w-4" />
              Accueil
            </Button>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Group Info */}
        {myGroupe && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-primary/10 to-secondary/10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-card rounded-lg">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Mon Groupe</h2>
                <p className="text-lg">
                  {myGroupe.nom} - <span className="font-semibold text-primary">{myGroupe.niveau}</span>
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Upcoming Courses */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-6">Cours à Venir</h2>
          
          {cours.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Aucun cours planifié pour le moment</p>
              <p className="text-sm text-muted-foreground mt-2">
                Les cours apparaîtront ici une fois que votre professeur les aura créés
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {cours.map((c) => {
                const canJoin = canJoinCours(c.date, c.heure);
                const coursDate = new Date(c.date);
                const isToday = coursDate.toDateString() === new Date().toDateString();
                
                return (
                  <Card key={c.id} className={`p-6 ${isToday ? 'border-primary' : ''}`}>
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Video className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{c.titre}</h3>
                            {c.description && (
                              <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm ml-11">
                          <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {coursDate.toLocaleDateString('fr-FR', { 
                              weekday: 'long', 
                              day: 'numeric', 
                              month: 'long',
                              year: 'numeric'
                            })}
                            {isToday && (
                              <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                                Aujourd'hui
                              </span>
                            )}
                          </span>
                          <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {c.heure}
                          </span>
                          {c.profiles && (
                            <span className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              Prof. {c.profiles.prenom} {c.profiles.nom}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 md:items-end justify-center">
                        {canJoin ? (
                          <Button 
                            onClick={() => handleJoinZoom(c.lien_zoom)}
                            className="w-full md:w-auto"
                          >
                            <Video className="mr-2 h-4 w-4" />
                            Rejoindre le Cours
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            disabled
                            className="w-full md:w-auto"
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            Disponible 30min avant
                          </Button>
                        )}
                        
                        <span className={`px-3 py-1 rounded-full text-xs font-medium text-center ${
                          c.statut === 'planifie' ? 'bg-primary/10 text-primary' :
                          c.statut === 'en_cours' ? 'bg-success/10 text-success' :
                          c.statut === 'termine' ? 'bg-muted text-muted-foreground' :
                          'bg-destructive/10 text-destructive'
                        }`}>
                          {c.statut === 'planifie' ? 'Planifié' :
                           c.statut === 'en_cours' ? 'En cours' :
                           c.statut === 'termine' ? 'Terminé' : 'Annulé'}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
