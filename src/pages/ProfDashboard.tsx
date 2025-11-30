import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Plus, Users, BookOpen, LogOut } from 'lucide-react';

export default function ProfDashboard() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [groupes, setGroupes] = useState<any[]>([]);
  const [cours, setCours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    date: '',
    heure: '',
    lien_zoom: '',
    groupe_id: '',
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch groupes where user is professeur
      const { data: groupesData } = await supabase
        .from('groupes')
        .select('*')
        .eq('professeur_id', user?.id);
      
      setGroupes(groupesData || []);

      // Fetch cours created by this professeur
      const { data: coursData } = await supabase
        .from('cours')
        .select(`
          *,
          groupes(nom, niveau)
        `)
        .eq('professeur_id', user?.id)
        .order('date', { ascending: true });
      
      setCours(coursData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleCreateCours = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titre || !formData.date || !formData.heure || !formData.lien_zoom || !formData.groupe_id) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.from('cours').insert({
        titre: formData.titre,
        description: formData.description,
        date: formData.date,
        heure: formData.heure,
        lien_zoom: formData.lien_zoom,
        groupe_id: formData.groupe_id,
        professeur_id: user?.id,
        statut: 'planifie',
      });

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Le cours a été créé avec succès',
      });

      setOpen(false);
      setFormData({
        titre: '',
        description: '',
        date: '',
        heure: '',
        lien_zoom: '',
        groupe_id: '',
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
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
          <h1 className="text-2xl font-bold text-primary">Dashboard Professeur</h1>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mes Groupes</p>
                <p className="text-2xl font-bold">{groupes.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cours Planifiés</p>
                <p className="text-2xl font-bold">{cours.filter(c => c.statut === 'planifie').length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-lg">
                <Calendar className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cours Aujourd'hui</p>
                <p className="text-2xl font-bold">
                  {cours.filter(c => c.date === new Date().toISOString().split('T')[0]).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Create Course Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Mes Cours</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Créer un Cours
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un Nouveau Cours</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCours} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titre">Titre du Cours *</Label>
                  <Input
                    id="titre"
                    value={formData.titre}
                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                    placeholder="Ex: Introduction à la grammaire allemande"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description du contenu du cours..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="heure">Heure *</Label>
                    <Input
                      id="heure"
                      type="time"
                      value={formData.heure}
                      onChange={(e) => setFormData({ ...formData, heure: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="groupe">Groupe *</Label>
                  <Select value={formData.groupe_id} onValueChange={(value) => setFormData({ ...formData, groupe_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un groupe" />
                    </SelectTrigger>
                    <SelectContent>
                      {groupes.map((groupe) => (
                        <SelectItem key={groupe.id} value={groupe.id}>
                          {groupe.nom} - {groupe.niveau}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lien_zoom">Lien Zoom *</Label>
                  <Input
                    id="lien_zoom"
                    type="url"
                    value={formData.lien_zoom}
                    onChange={(e) => setFormData({ ...formData, lien_zoom: e.target.value })}
                    placeholder="https://zoom.us/j/..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    Créer le Cours
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cours List */}
        <div className="grid gap-4">
          {cours.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Aucun cours planifié pour le moment</p>
              <p className="text-sm text-muted-foreground mt-2">Créez votre premier cours avec le bouton ci-dessus</p>
            </Card>
          ) : (
            cours.map((c) => (
              <Card key={c.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{c.titre}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{c.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(c.date).toLocaleDateString('fr-FR')} à {c.heure}
                      </span>
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {c.groupes?.nom} - {c.groupes?.niveau}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(c.lien_zoom, '_blank')}
                    >
                      Ouvrir Zoom
                    </Button>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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
            ))
          )}
        </div>
      </main>
    </div>
  );
}
