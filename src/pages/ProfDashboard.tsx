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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { StudentFeedback } from '@/components/StudentFeedback';
import { Calendar, Plus, Users, BookOpen, LogOut, FileText, Upload, Download, Edit2, Trash2 } from 'lucide-react';

export default function ProfDashboard() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [groupes, setGroupes] = useState<any[]>([]);
  const [cours, setCours] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [exercices, setExercices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCours, setOpenCours] = useState(false);
  const [openDoc, setOpenDoc] = useState(false);
  const [openExercice, setOpenExercice] = useState(false);
  const [editingCours, setEditingCours] = useState<any>(null);
  
  const [coursFormData, setCoursFormData] = useState({
    titre: '',
    description: '',
    date: '',
    heure: '',
    lien_zoom: '',
    groupe_id: '',
  });

  const [docFormData, setDocFormData] = useState({
    titre: '',
    fichier_url: '',
    type: 'PDF',
    cours_id: '',
  });

  const [exerciceFormData, setExerciceFormData] = useState({
    titre: '',
    type: 'quiz',
    duree: 30,
    groupe_id: '',
    questions: [{ question: '', reponses: ['', '', '', ''], correcte: 0 }],
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

      if (groupesData && groupesData.length > 0) {
        const groupeIds = groupesData.map(g => g.id);
        
      const { data: membersData } = await supabase
        .from('group_members')
        .select('etudiant_id')
        .in('groupe_id', groupeIds);
      
      if (membersData && membersData.length > 0) {
        const etudiantIds = membersData.map(m => m.etudiant_id);
        
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', etudiantIds);
        
        setStudents(profilesData || []);
      }
      }

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

      // Fetch documents
      const { data: docsData } = await supabase
        .from('documents')
        .select(`
          *,
          cours(titre, groupes(nom))
        `)
        .order('date_upload', { ascending: false });
      
      setDocuments(docsData || []);

      // Fetch exercices
      const { data: exercicesData } = await supabase
        .from('exercices')
        .select(`
          *,
          groupes(nom, niveau)
        `)
        .order('date_creation', { ascending: false });
      
      setExercices(exercicesData || []);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleCreateCours = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!coursFormData.titre || !coursFormData.date || !coursFormData.heure || !coursFormData.lien_zoom || !coursFormData.groupe_id) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    try {
      const dataToSave = {
        titre: coursFormData.titre,
        description: coursFormData.description,
        date: coursFormData.date,
        heure: coursFormData.heure,
        lien_zoom: coursFormData.lien_zoom,
        groupe_id: coursFormData.groupe_id,
        professeur_id: user?.id,
        statut: 'planifie',
      };

      if (editingCours) {
        const { error } = await supabase
          .from('cours')
          .update(dataToSave)
          .eq('id', editingCours.id);
        
        if (error) throw error;
        
        toast({
          title: 'Succès',
          description: 'Le cours a été modifié avec succès',
        });
      } else {
        const { error } = await supabase.from('cours').insert(dataToSave);
        if (error) throw error;
        
        toast({
          title: 'Succès',
          description: 'Le cours a été créé avec succès',
        });
      }

      setOpenCours(false);
      setEditingCours(null);
      setCoursFormData({
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

  const handleDeleteCours = async (coursId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;
    
    try {
      const { error } = await supabase.from('cours').delete().eq('id', coursId);
      if (error) throw error;
      
      toast({
        title: 'Succès',
        description: 'Le cours a été supprimé',
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

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.from('documents').insert({
        titre: docFormData.titre,
        fichier_url: docFormData.fichier_url,
        type: docFormData.type,
        cours_id: docFormData.cours_id || null,
      });

      if (error) throw error;
      
      toast({
        title: 'Succès',
        description: 'Le document a été ajouté',
      });
      
      setOpenDoc(false);
      setDocFormData({ titre: '', fichier_url: '', type: 'PDF', cours_id: '' });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleCreateExercice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.from('exercices').insert({
        titre: exerciceFormData.titre,
        type: exerciceFormData.type,
        duree: exerciceFormData.duree,
        groupe_id: exerciceFormData.groupe_id,
        questions: exerciceFormData.questions,
      });

      if (error) throw error;
      
      toast({
        title: 'Succès',
        description: 'L\'exercice a été créé',
      });
      
      setOpenExercice(false);
      setExerciceFormData({
        titre: '',
        type: 'quiz',
        duree: 30,
        groupe_id: '',
        questions: [{ question: '', reponses: ['', '', '', ''], correcte: 0 }],
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

  const downloadPresences = async (coursId: string, coursTitle: string) => {
    try {
      const { data, error } = await supabase
        .from('presences')
        .select('*')
        .eq('cours_id', coursId);
      
      if (error) throw error;
      
      // Fetch student profiles separately
      const presencesWithProfiles = await Promise.all(
        (data || []).map(async (presence) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('nom, prenom')
            .eq('id', presence.etudiant_id)
            .single();
          
          return {
            ...presence,
            profile,
          };
        })
      );
      
      // Create CSV content
      const csvContent = [
        ['Nom', 'Prénom', 'Présent', 'Date'].join(','),
        ...presencesWithProfiles.map(p => 
          [
            p.profile?.nom || '',
            p.profile?.prenom || '',
            p.present ? 'Oui' : 'Non',
            new Date(p.date).toLocaleDateString('fr-FR')
          ].join(',')
        )
      ].join('\n');
      
      // Download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presences_${coursTitle}.csv`;
      a.click();
      
      toast({
        title: 'Succès',
        description: 'Les présences ont été téléchargées',
      });
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                <Users className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Étudiants</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Documents</p>
                <p className="text-2xl font-bold">{documents.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="cours" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cours">Cours</TabsTrigger>
            <TabsTrigger value="students">Étudiants</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="exercices">Quiz/Devoirs</TabsTrigger>
          </TabsList>

          {/* Cours Tab */}
          <TabsContent value="cours" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Mes Cours</h2>
              <Dialog open={openCours} onOpenChange={setOpenCours}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingCours(null)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un Cours
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingCours ? 'Modifier' : 'Créer'} un Cours</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateCours} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="titre">Titre du Cours *</Label>
                      <Input
                        id="titre"
                        value={coursFormData.titre}
                        onChange={(e) => setCoursFormData({ ...coursFormData, titre: e.target.value })}
                        placeholder="Ex: Introduction à la grammaire allemande"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={coursFormData.description}
                        onChange={(e) => setCoursFormData({ ...coursFormData, description: e.target.value })}
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
                          value={coursFormData.date}
                          onChange={(e) => setCoursFormData({ ...coursFormData, date: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="heure">Heure *</Label>
                        <Input
                          id="heure"
                          type="time"
                          value={coursFormData.heure}
                          onChange={(e) => setCoursFormData({ ...coursFormData, heure: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="groupe">Groupe *</Label>
                      <Select value={coursFormData.groupe_id} onValueChange={(value) => setCoursFormData({ ...coursFormData, groupe_id: value })}>
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
                        value={coursFormData.lien_zoom}
                        onChange={(e) => setCoursFormData({ ...coursFormData, lien_zoom: e.target.value })}
                        placeholder="https://zoom.us/j/..."
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => {
                        setOpenCours(false);
                        setEditingCours(null);
                      }}>
                        Annuler
                      </Button>
                      <Button type="submit">
                        {editingCours ? 'Modifier' : 'Créer'} le Cours
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {cours.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Aucun cours planifié pour le moment</p>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadPresences(c.id, c.titre)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Présences
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingCours(c);
                            setCoursFormData({
                              titre: c.titre,
                              description: c.description || '',
                              date: c.date,
                              heure: c.heure,
                              lien_zoom: c.lien_zoom,
                              groupe_id: c.groupe_id,
                            });
                            setOpenCours(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCours(c.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <h2 className="text-xl font-bold">Liste des Étudiants</h2>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prénom</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Commentaire</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student: any) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.nom}</TableCell>
                      <TableCell>{student.prenom}</TableCell>
                      <TableCell>{student.telephone}</TableCell>
                      <TableCell>
                        <StudentFeedback 
                          studentId={student.id}
                          studentName={`${student.prenom} ${student.nom}`}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Documents</h2>
              <Dialog open={openDoc} onOpenChange={setOpenDoc}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Déposer un Document
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un Document</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateDocument} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="doc-titre">Titre *</Label>
                      <Input
                        id="doc-titre"
                        value={docFormData.titre}
                        onChange={(e) => setDocFormData({ ...docFormData, titre: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doc-url">URL du fichier *</Label>
                      <Input
                        id="doc-url"
                        type="url"
                        value={docFormData.fichier_url}
                        onChange={(e) => setDocFormData({ ...docFormData, fichier_url: e.target.value })}
                        placeholder="https://..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doc-type">Type</Label>
                      <Select value={docFormData.type} onValueChange={(value) => setDocFormData({ ...docFormData, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PDF">PDF</SelectItem>
                          <SelectItem value="Audio">Audio</SelectItem>
                          <SelectItem value="Video">Vidéo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doc-cours">Cours associé</Label>
                      <Select value={docFormData.cours_id} onValueChange={(value) => setDocFormData({ ...docFormData, cours_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Optionnel" />
                        </SelectTrigger>
                        <SelectContent>
                          {cours.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.titre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setOpenDoc(false)}>
                        Annuler
                      </Button>
                      <Button type="submit">Ajouter</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid gap-4">
              {documents.map((doc: any) => (
                <Card key={doc.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{doc.titre}</h3>
                      <p className="text-sm text-muted-foreground">{doc.type}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.open(doc.fichier_url, '_blank')}>
                      Ouvrir
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Exercices Tab */}
          <TabsContent value="exercices" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Quiz & Devoirs</h2>
              <Dialog open={openExercice} onOpenChange={setOpenExercice}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un Exercice
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Créer un Quiz/Devoir</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateExercice} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ex-titre">Titre *</Label>
                      <Input
                        id="ex-titre"
                        value={exerciceFormData.titre}
                        onChange={(e) => setExerciceFormData({ ...exerciceFormData, titre: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ex-type">Type</Label>
                        <Select value={exerciceFormData.type} onValueChange={(value) => setExerciceFormData({ ...exerciceFormData, type: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quiz">Quiz</SelectItem>
                            <SelectItem value="devoir">Devoir</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ex-duree">Durée (min)</Label>
                        <Input
                          id="ex-duree"
                          type="number"
                          value={exerciceFormData.duree}
                          onChange={(e) => setExerciceFormData({ ...exerciceFormData, duree: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ex-groupe">Groupe *</Label>
                      <Select value={exerciceFormData.groupe_id} onValueChange={(value) => setExerciceFormData({ ...exerciceFormData, groupe_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {groupes.map((g) => (
                            <SelectItem key={g.id} value={g.id}>
                              {g.nom} - {g.niveau}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setOpenExercice(false)}>
                        Annuler
                      </Button>
                      <Button type="submit">Créer</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid gap-4">
              {exercices.map((ex: any) => (
                <Card key={ex.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{ex.titre}</h3>
                      <p className="text-sm text-muted-foreground">
                        {ex.type === 'quiz' ? 'Quiz' : 'Devoir'} - {ex.duree} min - {ex.groupes?.nom}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
