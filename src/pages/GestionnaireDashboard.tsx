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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Users, CheckCircle, XCircle, Plus, UserPlus, Mail, Eye, ExternalLink } from 'lucide-react';

interface Profile {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  statut: string;
  date_inscription: string;
  photo_paiement?: string;
}

interface Groupe {
  id: string;
  nom: string;
  niveau: string;
  couleur: string;
  horaire: string;
  professeur_id?: string;
  profiles?: {
    nom: string;
    prenom: string;
  };
  studentCount?: number;
  students?: Array<{
    id: string;
    nom: string;
    prenom: string;
    date_inscription: string;
  }>;
}

interface GroupMember {
  groupe_id: string;
  etudiant_id: string;
}

interface ContactMessage {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  message: string;
  date_soumission: string;
  lu: boolean;
}

const GestionnaireDashboard = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pendingProfiles, setPendingProfiles] = useState<Profile[]>([]);
  const [validProfiles, setValidProfiles] = useState<Profile[]>([]);
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [professors, setProfessors] = useState<any[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedGroupeId, setSelectedGroupeId] = useState<string>('');
  const [selectedProfId, setSelectedProfId] = useState<string>('');
  const [validatingStudent, setValidatingStudent] = useState<string | null>(null);
  const [selectedNiveau, setSelectedNiveau] = useState<string>('A1');
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
    fetchValidProfiles();
    fetchGroupes();
    fetchProfessors();
    fetchContactMessages();
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

  const fetchValidProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('statut', 'valide')
        .order('date_inscription', { ascending: false });

      if (error) throw error;
      setValidProfiles(data || []);
    } catch (error) {
      console.error('Error fetching valid profiles:', error);
    }
  };

  const fetchProfessors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or('statut.eq.en_attente_prof,statut.eq.valide_prof,statut.eq.refuse_prof')
        .order('date_inscription', { ascending: false });

      if (error) throw error;
      setProfessors(data || []);
    } catch (error) {
      console.error('Error fetching professors:', error);
    }
  };

  const fetchContactMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('date_soumission', { ascending: false });

      if (error) throw error;
      setContactMessages(data || []);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les messages de contact',
        variant: 'destructive',
      });
    }
  };

  const fetchGroupes = async () => {
    try {
      const { data, error } = await supabase
        .from('groupes')
        .select('*')
        .order('niveau', { ascending: true });

      if (error) throw error;
      
      // Fetch student count and students for each group
      const groupesWithStudents = await Promise.all(
        (data || []).map(async (groupe) => {
          // Fetch professor profile if assigned
          let professorProfile = null;
          if (groupe.professeur_id) {
            const { data: profData } = await supabase
              .from('profiles')
              .select('nom, prenom')
              .eq('id', groupe.professeur_id)
              .single();
            professorProfile = profData;
          }
          
          const { data: members } = await supabase
            .from('group_members')
            .select('etudiant_id, date_assignation')
            .eq('groupe_id', groupe.id);
          
          // Get profile data for each member
          const studentsData = await Promise.all(
            (members || []).map(async (member) => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('id, nom, prenom, date_inscription')
                .eq('id', member.etudiant_id)
                .single();
              
              return profile;
            })
          );
          
          const students = studentsData.filter(s => s !== null);
          
          return {
            ...groupe,
            profiles: professorProfile,
            studentCount: students.length,
            students,
          };
        })
      );
      
      setGroupes(groupesWithStudents);
    } catch (error) {
      console.error('Error fetching groupes:', error);
    }
  };

  const handleValidateStudent = async (profileId: string, niveau: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          statut: 'valide',
          niveau: niveau 
        })
        .eq('id', profileId);

      if (error) throw error;

      toast({
        title: 'Inscription validée',
        description: `L'étudiant a été validé avec le niveau ${niveau}`,
      });

      setValidatingStudent(null);
      setSelectedNiveau('A1');
      fetchPendingProfiles();
      fetchValidProfiles();
    } catch (error) {
      console.error('Error validating student profile:', error);
      toast({
        title: 'Erreur',
        description: "Impossible de valider l'inscription de l'étudiant",
        variant: 'destructive',
      });
    }
  };

  const handleRejectStudent = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ statut: 'refuse' })
        .eq('id', profileId);

      if (error) throw error;

      toast({
        title: 'Inscription refusée',
        description: "L'étudiant a été notifié",
      });

      fetchPendingProfiles();
    } catch (error) {
      console.error('Error rejecting student profile:', error);
      toast({
        title: 'Erreur',
        description: "Impossible de refuser l'inscription de l'étudiant",
        variant: 'destructive',
      });
    }
  };

  const handleValidateProfessor = async (profileId: string) => {
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ statut: 'valide_prof' })
        .eq('id', profileId);

      if (profileError) throw profileError;

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: profileId, role: 'professeur' });

      if (roleError) throw roleError;

      toast({
        title: 'Professeur validé',
        description: 'Le professeur peut maintenant accéder à son espace et gérer ses groupes',
      });

      fetchProfessors();
    } catch (error) {
      console.error('Error validating professor profile:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de valider le professeur',
        variant: 'destructive',
      });
    }
  };

  const handleRejectProfessor = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ statut: 'refuse_prof' })
        .eq('id', profileId);

      if (error) throw error;

      toast({
        title: 'Inscription refusée',
        description: 'Le professeur a été notifié',
      });

      fetchProfessors();
    } catch (error) {
      console.error('Error rejecting professor profile:', error);
      toast({
        title: 'Erreur',
        description: "Impossible de refuser l'inscription du professeur",
        variant: 'destructive',
      });
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ lu: true })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: 'Message marqué comme lu',
      });

      fetchContactMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de marquer le message comme lu',
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
      // Insert into group_members
      const { error: memberError } = await supabase.from('group_members').insert({
        etudiant_id: selectedStudent,
        groupe_id: selectedGroupeId,
      });

      if (memberError) throw memberError;

      // Get group name for notification
      const groupe = groupes.find(g => g.id === selectedGroupeId);
      
      // Create notification for the student
      const { error: notifError } = await supabase.from('notifications').insert({
        user_id: selectedStudent,
        type: 'affectation_groupe',
        message: `Vous avez été affecté au groupe ${groupe?.nom} (${groupe?.niveau})`,
        lu: false,
      });

      if (notifError) {
        console.error('Error creating notification:', notifError);
      }

      toast({
        title: 'Étudiant affecté',
        description: 'L\'étudiant a été affecté au groupe et notifié avec succès',
      });

      setSelectedStudent(null);
      setSelectedGroupeId('');
      fetchGroupes(); // Refresh to update student counts
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
      case 'en_attente_prof':
        return <Badge className="bg-warning text-warning-foreground">En attente</Badge>;
      case 'valide':
        return <Badge className="bg-success text-success-foreground">Étudiant validé</Badge>;
      case 'valide_prof':
        return <Badge className="bg-success text-success-foreground">Professeur</Badge>;
      case 'refuse':
      case 'refuse_prof':
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
                  <p className="text-3xl font-bold mt-1">{validProfiles.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-success to-success-light flex items-center justify-center">
                  <Users className="h-6 w-6 text-success-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="students" className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="students">Étudiants en attente</TabsTrigger>
            <TabsTrigger value="professors">Professeurs</TabsTrigger>
            <TabsTrigger value="messages">
              Messages de contact
              {contactMessages.filter(m => !m.lu).length > 0 && (
                <Badge className="ml-2 bg-destructive text-destructive-foreground">
                  {contactMessages.filter(m => !m.lu).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-warning" />
                  Inscriptions étudiants en attente
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
                            {getStatusBadge(profile.statut)}
                            {profile.statut === 'en_attente' && (
                              <>
                                <Dialog open={validatingStudent === profile.id} onOpenChange={(open) => !open && setValidatingStudent(null)}>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      className="bg-success hover:bg-success/90 text-success-foreground"
                                      onClick={() => setValidatingStudent(profile.id)}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Valider
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Valider l'inscription</DialogTitle>
                                      <DialogDescription>
                                        Vérifiez la preuve de paiement et choisissez le niveau pour {profile.prenom} {profile.nom}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      {/* Payment Proof Section */}
                                      <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                          <Eye className="h-4 w-4" />
                                          Preuve de paiement
                                        </Label>
                                        {profile.photo_paiement ? (
                                          <div className="border rounded-lg p-4 bg-muted/50">
                                            <img 
                                              src={profile.photo_paiement} 
                                              alt="Preuve de paiement" 
                                              className="max-h-64 w-auto mx-auto rounded-lg shadow-md"
                                            />
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="mt-3 w-full"
                                              onClick={() => window.open(profile.photo_paiement, '_blank')}
                                            >
                                              <ExternalLink className="h-4 w-4 mr-2" />
                                              Ouvrir en plein écran
                                            </Button>
                                          </div>
                                        ) : (
                                          <div className="border rounded-lg p-4 bg-destructive/10 text-destructive text-center">
                                            Aucune preuve de paiement téléchargée
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label htmlFor="niveau-validation">Niveau *</Label>
                                        <Select
                                          value={selectedNiveau}
                                          onValueChange={setSelectedNiveau}
                                        >
                                          <SelectTrigger id="niveau-validation">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="A1">A1</SelectItem>
                                            <SelectItem value="A2">A2</SelectItem>
                                            <SelectItem value="B1">B1</SelectItem>
                                            <SelectItem value="B2">B2</SelectItem>
                                            <SelectItem value="C1">C1</SelectItem>
                                            <SelectItem value="C2">C2</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() => setValidatingStudent(null)}
                                      >
                                        Annuler
                                      </Button>
                                      <Button
                                        className="bg-success hover:bg-success/90 text-success-foreground"
                                        onClick={() => handleValidateStudent(profile.id, selectedNiveau)}
                                      >
                                        Valider
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                  onClick={() => handleRejectStudent(profile.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Refuser
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professors">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Gestion des professeurs
                </CardTitle>
                <CardDescription>Tous les professeurs inscrits</CardDescription>
              </CardHeader>
              <CardContent>
                {professors.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun professeur inscrit
                  </p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {professors.map((prof) => (
                      <div
                        key={prof.id}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold">
                            {prof.prenom} {prof.nom}
                          </h4>
                          <p className="text-sm text-muted-foreground">{prof.telephone}</p>
                          <p className="text-sm text-muted-foreground">{prof.adresse}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Inscrit le: {new Date(prof.date_inscription).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {getStatusBadge(prof.statut)}
                          {prof.statut === 'en_attente_prof' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-success hover:bg-success/90 text-success-foreground"
                                onClick={() => handleValidateProfessor(prof.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Valider
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => handleRejectProfessor(prof.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Refuser
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Messages de contact
                </CardTitle>
                <CardDescription>Messages reçus depuis le formulaire de contact de la page d'accueil</CardDescription>
              </CardHeader>
              <CardContent>
                {contactMessages.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun message de contact
                  </p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {contactMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 rounded-lg border ${
                          message.lu 
                            ? 'bg-muted/30 border-border' 
                            : 'bg-primary/5 border-primary/20'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{message.nom}</h4>
                              {!message.lu && (
                                <Badge className="bg-primary text-primary-foreground">Nouveau</Badge>
                              )}
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Mail className="h-3 w-3" />
                                {message.email}
                              </p>
                              {message.telephone && (
                                <p className="text-sm text-muted-foreground">
                                  📞 {message.telephone}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                Reçu le: {new Date(message.date_soumission).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          {!message.lu && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsRead(message.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Marquer comme lu
                            </Button>
                          )}
                        </div>
                        <div className="mt-3 p-3 bg-background rounded border border-border">
                          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">

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
                    <TableHead>Professeur</TableHead>
                    <TableHead>Horaire</TableHead>
                    <TableHead>Étudiants</TableHead>
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
                      <TableCell className="text-sm">
                        {groupe.profiles ? (
                          <span className="font-medium">
                            {groupe.profiles.prenom} {groupe.profiles.nom}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">Non assigné</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {groupe.horaire || 'Non défini'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {groupe.studentCount || 0} étudiant{(groupe.studentCount || 0) > 1 ? 's' : ''}
                        </Badge>
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
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Gérer le groupe {groupe.nom}</DialogTitle>
                              <DialogDescription>
                                Total: {groupe.studentCount || 0} étudiant{(groupe.studentCount || 0) > 1 ? 's' : ''} dans ce groupe
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-6 py-4">
                              {/* Affecter un professeur */}
                              <div className="space-y-3 pb-4 border-b">
                                <h4 className="font-semibold text-sm">Professeur assigné</h4>
                                <div className="space-y-2">
                                  <Label>Sélectionner un professeur</Label>
                                  <div className="flex gap-2">
                                    <Select
                                      value={selectedProfId || groupe.professeur_id || ''}
                                      onValueChange={setSelectedProfId}
                                    >
                                      <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Choisir un professeur" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {professors.map((prof) => (
                                          <SelectItem key={prof.id} value={prof.id}>
                                            {prof.prenom} {prof.nom}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      onClick={async () => {
                                        if (!selectedProfId) return;
                                        try {
                                          const { error } = await supabase
                                            .from('groupes')
                                            .update({ professeur_id: selectedProfId })
                                            .eq('id', groupe.id);
                                          
                                          if (error) throw error;
                                          
                                          toast({
                                            title: 'Professeur assigné',
                                            description: 'Le professeur a été assigné au groupe avec succès',
                                          });
                                          
                                          fetchGroupes();
                                          setSelectedProfId('');
                                        } catch (error) {
                                          console.error('Error assigning professor:', error);
                                          toast({
                                            title: 'Erreur',
                                            description: 'Impossible d\'assigner le professeur',
                                            variant: 'destructive',
                                          });
                                        }
                                      }}
                                      disabled={!selectedProfId}
                                    >
                                      Assigner
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Liste des étudiants actuels */}
                              {groupe.students && groupe.students.length > 0 && (
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-sm">Étudiants affectés</h4>
                                  <div className="border rounded-lg max-h-60 overflow-y-auto">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Nom</TableHead>
                                          <TableHead>Prénom</TableHead>
                                          <TableHead>Date d'inscription</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {groupe.students.map((student) => (
                                          <TableRow key={student.id}>
                                            <TableCell className="font-medium">{student.nom}</TableCell>
                                            <TableCell>{student.prenom}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                              {new Date(student.date_inscription).toLocaleDateString('fr-FR')}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              )}
                              
                              {/* Affecter un nouvel étudiant */}
                              <div className="space-y-3 pt-4 border-t">
                                <h4 className="font-semibold text-sm">Affecter un nouvel étudiant</h4>
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
                                      {validProfiles.map((profile) => (
                                        <SelectItem key={profile.id} value={profile.id}>
                                          {profile.prenom} {profile.nom} - Inscrit le {new Date(profile.date_inscription).toLocaleDateString('fr-FR')}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button
                                onClick={() => {
                                  setSelectedGroupeId(groupe.id);
                                  handleAssignToGroup();
                                }}
                                disabled={!selectedStudent}
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
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
