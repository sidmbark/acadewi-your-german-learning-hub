import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Users, CheckCircle, XCircle, Plus, UserPlus } from 'lucide-react';

interface Profile {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  statut: string;
  date_inscription: string;
}

interface Groupe {
  id: string;
  nom: string;
  niveau: string;
  couleur: string;
  horaire: string;
}

interface GroupMember {
  groupe_id: string;
  etudiant_id: string;
}

const GestionnaireDashboard = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pendingProfiles, setPendingProfiles] = useState<Profile[]>([]);
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedGroupeId, setSelectedGroupeId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Form state for creating a new group
  const [newGroupe, setNewGroupe] = useState({
    nom: '',
    niveau: 'A1',
    couleur: '#2563eb',
    horaire: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (userRole !== 'gestionnaire') {
      navigate('/dashboard');
      return;
    }

    fetchPendingProfiles();
    fetchGroupes();
  }, [user, userRole, navigate]);

  const fetchPendingProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('statut', 'en_attente')
        .order('date_inscription', { ascending: false });

      if (error) throw error;
      setPendingProfiles(data || []);
    } catch (error) {
      console.error('Error fetching pending profiles:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les inscriptions en attente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupes = async () => {
    try {
      const { data, error } = await supabase
        .from('groupes')
        .select('*')
        .order('niveau', { ascending: true });

      if (error) throw error;
      setGroupes(data || []);
    } catch (error) {
      console.error('Error fetching groupes:', error);
    }
  };

  const handleValidateProfile = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ statut: 'valide' })
        .eq('id', profileId);

      if (error) throw error;

      toast({
        title: 'Inscription validée',
        description: 'L\'étudiant peut maintenant accéder à la plateforme',
      });

      fetchPendingProfiles();
    } catch (error) {
      console.error('Error validating profile:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de valider l\'inscription',
        variant: 'destructive',
      });
    }
  };

  const handleRejectProfile = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ statut: 'refuse' })
        .eq('id', profileId);

      if (error) throw error;

      toast({
        title: 'Inscription refusée',
        description: 'L\'étudiant a été notifié',
      });

      fetchPendingProfiles();
    } catch (error) {
      console.error('Error rejecting profile:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de refuser l\'inscription',
        variant: 'destructive',
      });
    }
  };

  const handleCreateGroupe = async () => {
    if (!newGroupe.nom || !newGroupe.niveau) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.from('groupes').insert({
        nom: newGroupe.nom,
        niveau: newGroupe.niveau,
        couleur: newGroupe.couleur,
        horaire: newGroupe.horaire,
      });

      if (error) throw error;

      toast({
        title: 'Groupe créé',
        description: `Le groupe ${newGroupe.nom} a été créé avec succès`,
      });

      setNewGroupe({ nom: '', niveau: 'A1', couleur: '#2563eb', horaire: '' });
      fetchGroupes();
    } catch (error) {
      console.error('Error creating groupe:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le groupe',
        variant: 'destructive',
      });
    }
  };

  const handleAssignToGroup = async () => {
    if (!selectedStudent || !selectedGroupeId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un étudiant et un groupe',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.from('group_members').insert({
        etudiant_id: selectedStudent,
        groupe_id: selectedGroupeId,
      });

      if (error) throw error;

      toast({
        title: 'Étudiant affecté',
        description: 'L\'étudiant a été affecté au groupe avec succès',
      });

      setSelectedStudent(null);
      setSelectedGroupeId('');
    } catch (error) {
      console.error('Error assigning to group:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'affecter l\'étudiant au groupe',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return <Badge className="bg-warning text-warning-foreground">En attente</Badge>;
      case 'valide':
        return <Badge className="bg-success text-success-foreground">Validé</Badge>;
      case 'refuse':
        return <Badge className="bg-destructive text-destructive-foreground">Refusé</Badge>;
      default:
        return <Badge>{statut}</Badge>;
    }
  };

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
            <span className="text-sm text-muted-foreground">
              Gestionnaire: <span className="font-semibold text-foreground">{user?.email}</span>
            </span>
            <Button variant="outline" onClick={signOut}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard Gestionnaire</h1>
          <p className="text-muted-foreground">
            Gérez les inscriptions, créez des groupes et affectez les étudiants
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inscriptions en attente</p>
                  <p className="text-3xl font-bold mt-1">{pendingProfiles.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-warning to-warning flex items-center justify-center">
                  <Users className="h-6 w-6 text-warning-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Groupes actifs</p>
                  <p className="text-3xl font-bold mt-1">{groupes.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total étudiants</p>
                  <p className="text-3xl font-bold mt-1">-</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-success to-success-light flex items-center justify-center">
                  <Users className="h-6 w-6 text-success-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Inscriptions en attente */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-warning" />
                Inscriptions en attente
              </CardTitle>
              <CardDescription>Validez ou refusez les nouvelles inscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingProfiles.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucune inscription en attente
                </p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {pendingProfiles.map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold">
                          {profile.prenom} {profile.nom}
                        </h4>
                        <p className="text-sm text-muted-foreground">{profile.telephone}</p>
                        <p className="text-sm text-muted-foreground">{profile.adresse}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Inscrit le: {new Date(profile.date_inscription).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-success hover:bg-success/90 text-success-foreground"
                          onClick={() => handleValidateProfile(profile.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Valider
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleRejectProfile(profile.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Refuser
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Créer un groupe */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Créer un nouveau groupe
              </CardTitle>
              <CardDescription>Définissez les paramètres du groupe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom du groupe *</Label>
                <Input
                  id="nom"
                  placeholder="Ex: Groupe du matin A1"
                  value={newGroupe.nom}
                  onChange={(e) => setNewGroupe({ ...newGroupe, nom: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="niveau">Niveau *</Label>
                <Select
                  value={newGroupe.niveau}
                  onValueChange={(value) => setNewGroupe({ ...newGroupe, niveau: value })}
                >
                  <SelectTrigger id="niveau">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A1">A1 - Débutant</SelectItem>
                    <SelectItem value="A2">A2 - Élémentaire</SelectItem>
                    <SelectItem value="B1">B1 - Intermédiaire</SelectItem>
                    <SelectItem value="B2">B2 - Intermédiaire avancé</SelectItem>
                    <SelectItem value="C1">C1 - Avancé</SelectItem>
                    <SelectItem value="C2">C2 - Maîtrise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="horaire">Horaire</Label>
                <Input
                  id="horaire"
                  placeholder="Ex: Lundi et Mercredi 14h-16h"
                  value={newGroupe.horaire}
                  onChange={(e) => setNewGroupe({ ...newGroupe, horaire: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="couleur">Couleur du groupe</Label>
                <div className="flex gap-2">
                  <Input
                    id="couleur"
                    type="color"
                    value={newGroupe.couleur}
                    onChange={(e) => setNewGroupe({ ...newGroupe, couleur: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={newGroupe.couleur}
                    onChange={(e) => setNewGroupe({ ...newGroupe, couleur: e.target.value })}
                    placeholder="#2563eb"
                    className="flex-1"
                  />
                </div>
              </div>

              <Button onClick={handleCreateGroupe} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Créer le groupe
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Liste des groupes */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Groupes existants
            </CardTitle>
            <CardDescription>
              Gérez vos groupes et affectez les étudiants
            </CardDescription>
          </CardHeader>
          <CardContent>
            {groupes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun groupe créé pour le moment
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Horaire</TableHead>
                    <TableHead>Couleur</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupes.map((groupe) => (
                    <TableRow key={groupe.id}>
                      <TableCell className="font-medium">{groupe.nom}</TableCell>
                      <TableCell>
                        <Badge className="bg-primary text-primary-foreground">{groupe.niveau}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {groupe.horaire || 'Non défini'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border border-border"
                            style={{ backgroundColor: groupe.couleur }}
                          />
                          <span className="text-xs text-muted-foreground">{groupe.couleur}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <UserPlus className="h-4 w-4 mr-1" />
                              Affecter
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Affecter un étudiant</DialogTitle>
                              <DialogDescription>
                                Sélectionnez un étudiant à affecter au groupe {groupe.nom}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Étudiant</Label>
                                <Select
                                  value={selectedStudent || ''}
                                  onValueChange={setSelectedStudent}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un étudiant" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {pendingProfiles.map((profile) => (
                                      <SelectItem key={profile.id} value={profile.id}>
                                        {profile.prenom} {profile.nom}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={() => {
                                  setSelectedGroupeId(groupe.id);
                                  handleAssignToGroup();
                                }}
                              >
                                Affecter au groupe
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GestionnaireDashboard;
