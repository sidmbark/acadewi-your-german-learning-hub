import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, LogOut, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CalendarPlanning from '@/components/CalendarPlanning';

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
      const { data: groupMember } = await supabase
        .from('group_members')
        .select('groupe_id, groupes(*)')
        .eq('etudiant_id', user?.id)
        .single();

      if (groupMember) {
        setMyGroupe(groupMember.groupes);

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        const { data: coursData, error } = await supabase
          .from('cours')
          .select(`
            *,
            groupes(nom, niveau)
          `)
          .eq('groupe_id', groupMember.groupe_id)
          .gte('date', yesterdayStr)
          .order('date', { ascending: true })
          .order('heure', { ascending: true });

        if (error) {
          console.error('Error fetching cours:', error);
        }

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

        <CalendarPlanning 
          cours={cours} 
          onJoinZoom={handleJoinZoom} 
          canJoinCours={canJoinCours}
        />
      </main>
    </div>
  );
}