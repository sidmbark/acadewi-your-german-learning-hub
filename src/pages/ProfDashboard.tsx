import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
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
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCours, setOpenCours] = useState(false);
  const [openDoc, setOpenDoc] = useState(false);
  const [openExercice, setOpenExercice] = useState(false);
  const [openEvaluation, setOpenEvaluation] = useState(false);
  const [openNotation, setOpenNotation] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null);
  const [editingCours, setEditingCours] = useState<any>(null);
  
  const [coursFormData, setCoursFormData] = useState({
    titre: '',
    description: '',
    date: '',
    heure: '',
    lien_zoom: '',
    groupe_id: '',
    recurrent: false,
    nombre_seances: 1,
    frequence: 'hebdomadaire' as 'quotidien' | 'hebdomadaire' | 'mensuel',
  });

  const [docFormData, setDocFormData] = useState({
    titre: '',
    type: 'PDF',
    selectedGroupes: [] as string[],
  });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [exerciceFormData, setExerciceFormData] = useState({
    titre: '',
    type: 'quiz',
    duree: 30,
    groupe_id: '',
    questions: [{ question: '', reponses: ['', '', '', ''], correcte: 0 }],
  });

  const [evaluationFormData, setEvaluationFormData] = useState({
    titre: '',
    description: '',
    type: 'devoir' as 'devoir' | 'examen' | 'quiz',
    date_limite: '',
    coefficient: 1,
    note_max: 20,
    groupe_id: '',
  });

  useEffect(() => {
    if (user) {
      fetchData();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchData();
      }, 30000);
      
      return () => clearInterval(interval);
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

      // Fetch documents created by this professor
      const { data: docsData } = await supabase
        .from('documents')
        .select(`
          *,
          document_groupe_access(
            groupe_id,
            groupes(nom, niveau)
          )
        `)
        .eq('professeur_id', user?.id)
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

      // Fetch submissions for professor's groups
      if (groupesData && groupesData.length > 0) {
        const groupeIds = groupesData.map(g => g.id);
        
        const { data: submissionsData } = await supabase
          .from('exercice_submissions')
          .select(`
            *,
            exercices!inner(
              titre,
              type,
              groupe_id,
              groupes(nom, niveau)
            ),
            profiles(nom, prenom)
          `)
          .in('exercices.groupe_id', groupeIds)
          .order('date_soumission', { ascending: false });
        
        setSubmissions(submissionsData || []);
      }

      // Fetch evaluations created by this professor
      const { data: evaluationsData } = await supabase
        .from('evaluations')
        .select(`
          *,
          groupes(nom, niveau)
        `)
        .eq('professeur_id', user?.id)
        .order('created_at', { ascending: false });

      setEvaluations(evaluationsData || []);

      // Fetch all notes for professor's evaluations
      if (evaluationsData && evaluationsData.length > 0) {
        const evalIds = evaluationsData.map((e: any) => e.id);
        
        const { data: notesData } = await supabase
          .from('notes')
          .select(`
            *,
            evaluations(titre, type, groupe_id, note_max, coefficient)
          `)
          .in('evaluation_id', evalIds);

        // Fetch student profiles for notes
        if (notesData && notesData.length > 0) {
          const notesWithProfiles = await Promise.all(
            notesData.map(async (note: any) => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('nom, prenom')
                .eq('id', note.etudiant_id)
                .single();
              return { ...note, profile };
            })
          );
          setNotes(notesWithProfiles);
        } else {
          setNotes([]);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleCreateCours = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!coursFormData.titre || !coursFormData.date || !coursFormData.heure || !coursFormData.groupe_id) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingCours) {
        // Mode édition : un seul cours
        let lienZoom = coursFormData.lien_zoom;
        
        const dataToSave = {
          titre: coursFormData.titre,
          description: coursFormData.description,
          date: coursFormData.date,
          heure: coursFormData.heure,
          lien_zoom: lienZoom,
          groupe_id: coursFormData.groupe_id,
          professeur_id: user?.id,
          statut: 'planifie',
        };

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
        // Mode création : possibilité de créer plusieurs cours
        const nombreCours = coursFormData.recurrent ? coursFormData.nombre_seances : 1;
        const coursToCreate = [];
        
        for (let i = 0; i < nombreCours; i++) {
          const currentDate = new Date(coursFormData.date);
          
          // Ajouter l'intervalle selon la fréquence
          if (coursFormData.frequence === 'quotidien') {
            currentDate.setDate(currentDate.getDate() + i);
          } else if (coursFormData.frequence === 'hebdomadaire') {
            currentDate.setDate(currentDate.getDate() + (i * 7));
          } else {
            currentDate.setMonth(currentDate.getMonth() + i);
          }
          
          const formattedDate = currentDate.toISOString().split('T')[0];
          const startDateTime = `${formattedDate}T${coursFormData.heure}:00`;
          const duration = 120; // 2 heures par défaut
          
          console.log(`Creating Zoom meeting ${i + 1}/${nombreCours}:`, coursFormData.titre);
          
          const { data: zoomData, error: zoomError } = await supabase.functions.invoke('create-zoom-meeting', {
            body: {
              topic: `${coursFormData.titre} - Séance ${i + 1}`,
              start_time: startDateTime,
              duration: duration,
            },
          });

          if (zoomError) {
            console.error('Zoom error:', zoomError);
            throw new Error(`Erreur lors de la création du meeting Zoom pour la séance ${i + 1}`);
          }

          if (!zoomData?.join_url) {
            throw new Error('URL Zoom non reçue');
          }

          coursToCreate.push({
            titre: `${coursFormData.titre}${nombreCours > 1 ? ` - Séance ${i + 1}` : ''}`,
            description: coursFormData.description,
            date: formattedDate,
            heure: coursFormData.heure,
            lien_zoom: zoomData.join_url,
            groupe_id: coursFormData.groupe_id,
            professeur_id: user?.id,
            statut: 'planifie',
          });
        }
        
        const { error } = await supabase.from('cours').insert(coursToCreate);
        if (error) throw error;
        
        toast({
          title: 'Succès',
          description: `${nombreCours} cours ${nombreCours > 1 ? 'ont été créés' : 'a été créé'} avec succès`,
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
        recurrent: false,
        nombre_seances: 1,
        frequence: 'hebdomadaire',
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
    
    if (!selectedFile) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un fichier',
        variant: 'destructive',
      });
      return;
    }

    if (docFormData.selectedGroupes.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner au moins un groupe',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setUploadingFile(true);

      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Insert document into database
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          titre: docFormData.titre,
          fichier_url: publicUrl,
          type: docFormData.type,
          professeur_id: user?.id,
        })
        .select()
        .single();

      if (docError) throw docError;

      // Insert document-group access links
      const accessLinks = docFormData.selectedGroupes.map(groupeId => ({
        document_id: docData.id,
        groupe_id: groupeId,
      }));

      const { error: accessError } = await supabase
        .from('document_groupe_access')
        .insert(accessLinks);

      if (accessError) throw accessError;
      
      toast({
        title: 'Succès',
        description: 'Le document a été ajouté et partagé avec les groupes sélectionnés',
      });
      
      setOpenDoc(false);
      setDocFormData({ titre: '', type: 'PDF', selectedGroupes: [] });
      setSelectedFile(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;
    
    try {
      const { error } = await supabase.from('documents').delete().eq('id', docId);
      if (error) throw error;
      
      toast({
        title: 'Succès',
        description: 'Le document a été supprimé',
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

  const handleCreateEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!evaluationFormData.titre || !evaluationFormData.groupe_id) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.from('evaluations').insert({
        titre: evaluationFormData.titre,
        description: evaluationFormData.description,
        type: evaluationFormData.type,
        date_limite: evaluationFormData.date_limite || null,
        coefficient: evaluationFormData.coefficient,
        note_max: evaluationFormData.note_max,
        groupe_id: evaluationFormData.groupe_id,
        professeur_id: user?.id,
      });

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'L\'évaluation a été créée',
      });

      setOpenEvaluation(false);
      setEvaluationFormData({
        titre: '',
        description: '',
        type: 'devoir',
        date_limite: '',
        coefficient: 1,
        note_max: 20,
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

  const handleSaveNote = async (evaluationId: string, etudiantId: string, note: number, commentaire: string) => {
    try {
      // Upsert note (insert or update)
      const { error } = await supabase
        .from('notes')
        .upsert({
          evaluation_id: evaluationId,
          etudiant_id: etudiantId,
          note,
          commentaire,
          date_notation: new Date().toISOString(),
        }, { onConflict: 'evaluation_id,etudiant_id' });

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Note enregistrée',
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

  const getStudentsForGroup = (groupeId: string) => {
    return students.filter((s: any) => {
      // Check if student is in this group
      return groupes.some((g: any) => g.id === groupeId);
    });
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="cours">Cours</TabsTrigger>
            <TabsTrigger value="students">Étudiants</TabsTrigger>
            <TabsTrigger value="evaluations">Évaluations</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="exercices">Quiz/Devoirs</TabsTrigger>
            <TabsTrigger value="soumissions">Soumissions</TabsTrigger>
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

                    {editingCours ? (
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
                    ) : (
                      <div className="rounded-lg bg-primary/10 p-4">
                        <p className="text-sm text-foreground flex items-center gap-2">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Un meeting Zoom sera créé automatiquement lors de la création du cours
                        </p>
                      </div>
                    )}

                    {!editingCours && (
                      <div className="space-y-4 border-t pt-4 mt-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="recurrent" className="text-base font-semibold">Créer plusieurs séances</Label>
                          <input
                            id="recurrent"
                            type="checkbox"
                            checked={coursFormData.recurrent}
                            onChange={(e) => setCoursFormData({ ...coursFormData, recurrent: e.target.checked })}
                            className="h-5 w-5 cursor-pointer"
                          />
                        </div>

                        {coursFormData.recurrent && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="nombre_seances">Nombre de séances *</Label>
                              <Input
                                id="nombre_seances"
                                type="number"
                                min="2"
                                max="52"
                                value={coursFormData.nombre_seances}
                                onChange={(e) => setCoursFormData({ ...coursFormData, nombre_seances: parseInt(e.target.value) || 1 })}
                                placeholder="Ex: 12"
                              />
                              <p className="text-xs text-muted-foreground">Entre 2 et 52 séances</p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="frequence">Fréquence *</Label>
                              <Select
                                value={coursFormData.frequence}
                                onValueChange={(value: 'quotidien' | 'hebdomadaire' | 'mensuel') => setCoursFormData({ ...coursFormData, frequence: value })}
                              >
                                <SelectTrigger id="frequence">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="quotidien">Quotidien (chaque jour)</SelectItem>
                                  <SelectItem value="hebdomadaire">Hebdomadaire (chaque semaine)</SelectItem>
                                  <SelectItem value="mensuel">Mensuel (chaque mois)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="bg-muted/50 p-3 rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                <strong>Aperçu:</strong> {coursFormData.nombre_seances} séances seront créées,
                                {coursFormData.frequence === 'quotidien' ? ' une par jour' : coursFormData.frequence === 'hebdomadaire' ? ' une par semaine' : ' une par mois'},
                                à partir du {coursFormData.date ? new Date(coursFormData.date).toLocaleDateString('fr-FR') : '...'}.
                                <br />
                                Un meeting Zoom unique sera généré pour chaque séance.
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}

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
                              recurrent: false,
                              nombre_seances: 1,
                              frequence: 'hebdomadaire',
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

          {/* Evaluations Tab */}
          <TabsContent value="evaluations" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Évaluations & Notes</h2>
              <Dialog open={openEvaluation} onOpenChange={setOpenEvaluation}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer une Évaluation
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Créer une Évaluation</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateEvaluation} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="eval-titre">Titre *</Label>
                      <Input
                        id="eval-titre"
                        value={evaluationFormData.titre}
                        onChange={(e) => setEvaluationFormData({ ...evaluationFormData, titre: e.target.value })}
                        placeholder="Ex: Examen de mi-parcours A1"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eval-description">Description</Label>
                      <Textarea
                        id="eval-description"
                        value={evaluationFormData.description}
                        onChange={(e) => setEvaluationFormData({ ...evaluationFormData, description: e.target.value })}
                        placeholder="Description de l'évaluation..."
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="eval-type">Type *</Label>
                        <Select
                          value={evaluationFormData.type}
                          onValueChange={(value: 'devoir' | 'examen' | 'quiz') => setEvaluationFormData({ ...evaluationFormData, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="devoir">Devoir</SelectItem>
                            <SelectItem value="examen">Examen</SelectItem>
                            <SelectItem value="quiz">Quiz</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="eval-groupe">Groupe *</Label>
                        <Select
                          value={evaluationFormData.groupe_id}
                          onValueChange={(value) => setEvaluationFormData({ ...evaluationFormData, groupe_id: value })}
                        >
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
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="eval-date">Date limite</Label>
                        <Input
                          id="eval-date"
                          type="datetime-local"
                          value={evaluationFormData.date_limite}
                          onChange={(e) => setEvaluationFormData({ ...evaluationFormData, date_limite: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="eval-coef">Coefficient</Label>
                        <Input
                          id="eval-coef"
                          type="number"
                          min="0.5"
                          max="10"
                          step="0.5"
                          value={evaluationFormData.coefficient}
                          onChange={(e) => setEvaluationFormData({ ...evaluationFormData, coefficient: parseFloat(e.target.value) })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="eval-max">Note max</Label>
                        <Input
                          id="eval-max"
                          type="number"
                          min="10"
                          max="100"
                          value={evaluationFormData.note_max}
                          onChange={(e) => setEvaluationFormData({ ...evaluationFormData, note_max: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setOpenEvaluation(false)}>
                        Annuler
                      </Button>
                      <Button type="submit">Créer l'évaluation</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Evaluations List */}
            <div className="grid gap-4">
              {evaluations.length > 0 ? (
                evaluations.map((evaluation: any) => (
                  <Card key={evaluation.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{evaluation.titre}</h3>
                          <Badge className={
                            evaluation.type === 'examen' ? 'bg-destructive text-destructive-foreground' :
                            evaluation.type === 'devoir' ? 'bg-primary text-primary-foreground' :
                            'bg-secondary text-secondary-foreground'
                          }>
                            {evaluation.type}
                          </Badge>
                        </div>
                        {evaluation.description && (
                          <p className="text-sm text-muted-foreground mt-1">{evaluation.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{evaluation.groupes?.nom} - {evaluation.groupes?.niveau}</span>
                          <span>Note max: {evaluation.note_max}</span>
                          <span>Coef: {evaluation.coefficient}</span>
                          {evaluation.date_limite && (
                            <span>Limite: {new Date(evaluation.date_limite).toLocaleDateString('fr-FR')}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedEvaluation(evaluation);
                          setOpenNotation(true);
                        }}
                      >
                        Noter les étudiants
                      </Button>
                    </div>

                    {/* Notes for this evaluation */}
                    {notes.filter((n: any) => n.evaluation_id === evaluation.id).length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2 text-sm">Notes attribuées:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {notes
                            .filter((n: any) => n.evaluation_id === evaluation.id)
                            .map((note: any) => (
                              <div key={note.id} className="bg-muted/50 p-2 rounded text-sm">
                                <span className="font-medium">{note.profile?.prenom} {note.profile?.nom}</span>
                                <span className="ml-2 text-primary font-bold">{note.note}/{evaluation.note_max}</span>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    )}
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Aucune évaluation créée. Créez votre première évaluation pour commencer à noter vos étudiants.</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Notation Dialog */}
          <Dialog open={openNotation} onOpenChange={setOpenNotation}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Noter les étudiants - {selectedEvaluation?.titre}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-muted/50 p-3 rounded-lg text-sm">
                  <span className="font-medium">Groupe:</span> {selectedEvaluation?.groupes?.nom} | 
                  <span className="font-medium ml-2">Note max:</span> {selectedEvaluation?.note_max} | 
                  <span className="font-medium ml-2">Coefficient:</span> {selectedEvaluation?.coefficient}
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Étudiant</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead>Commentaire</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student: any) => {
                      const existingNote = notes.find(
                        (n: any) => n.evaluation_id === selectedEvaluation?.id && n.etudiant_id === student.id
                      );
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            {student.prenom} {student.nom}
                          </TableCell>
                          <TableCell>
                            <Input
                              id={`note-${student.id}`}
                              type="number"
                              min="0"
                              max={selectedEvaluation?.note_max || 20}
                              step="0.5"
                              defaultValue={existingNote?.note || ''}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              id={`comment-${student.id}`}
                              type="text"
                              defaultValue={existingNote?.commentaire || ''}
                              placeholder="Commentaire..."
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => {
                                const noteInput = document.getElementById(`note-${student.id}`) as HTMLInputElement;
                                const commentInput = document.getElementById(`comment-${student.id}`) as HTMLInputElement;
                                const noteValue = parseFloat(noteInput.value);
                                
                                if (isNaN(noteValue)) {
                                  toast({
                                    title: 'Erreur',
                                    description: 'Veuillez entrer une note valide',
                                    variant: 'destructive',
                                  });
                                  return;
                                }
                                
                                handleSaveNote(
                                  selectedEvaluation.id,
                                  student.id,
                                  noteValue,
                                  commentInput.value
                                );
                              }}
                            >
                              Enregistrer
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                <div className="flex justify-end pt-4">
                  <Button variant="outline" onClick={() => setOpenNotation(false)}>
                    Fermer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

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
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Ajouter un Document</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateDocument} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="doc-titre">Titre du document *</Label>
                      <Input
                        id="doc-titre"
                        value={docFormData.titre}
                        onChange={(e) => setDocFormData({ ...docFormData, titre: e.target.value })}
                        placeholder="Ex: Vocabulaire - Leçon 5"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="doc-file">Fichier *</Label>
                      <Input
                        id="doc-file"
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        accept=".pdf,.doc,.docx,.mp3,.mp4,.wav,.mpeg"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Formats acceptés: PDF, DOC, DOCX, MP3, MP4, WAV
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doc-type">Type de document</Label>
                      <Select value={docFormData.type} onValueChange={(value) => setDocFormData({ ...docFormData, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PDF">PDF</SelectItem>
                          <SelectItem value="Audio">Audio</SelectItem>
                          <SelectItem value="Video">Vidéo</SelectItem>
                          <SelectItem value="Document">Document</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Partager avec les groupes *</Label>
                      <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                        {groupes.map((groupe) => (
                          <div key={groupe.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`groupe-${groupe.id}`}
                              checked={docFormData.selectedGroupes.includes(groupe.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setDocFormData({
                                    ...docFormData,
                                    selectedGroupes: [...docFormData.selectedGroupes, groupe.id],
                                  });
                                } else {
                                  setDocFormData({
                                    ...docFormData,
                                    selectedGroupes: docFormData.selectedGroupes.filter(id => id !== groupe.id),
                                  });
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <label
                              htmlFor={`groupe-${groupe.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {groupe.nom} - {groupe.niveau}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => {
                        setOpenDoc(false);
                        setSelectedFile(null);
                        setDocFormData({ titre: '', type: 'PDF', selectedGroupes: [] });
                      }}>
                        Annuler
                      </Button>
                      <Button type="submit" disabled={uploadingFile}>
                        {uploadingFile ? 'Upload en cours...' : 'Ajouter le document'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid gap-4">
              {documents.length > 0 ? (
                documents.map((doc: any) => (
                  <Card key={doc.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{doc.titre}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-muted-foreground">{doc.type}</p>
                          <span className="text-sm text-muted-foreground">•</span>
                          <p className="text-sm text-muted-foreground">
                            {new Date(doc.date_upload).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        {doc.document_groupe_access && doc.document_groupe_access.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {doc.document_groupe_access.map((access: any, idx: number) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                                {access.groupes?.nom}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.open(doc.fichier_url, '_blank')}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteDocument(doc.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Aucun document ajouté pour le moment
                </p>
              )}
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

          {/* Soumissions Tab */}
          <TabsContent value="soumissions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Soumissions d'exercices</h2>
              <p className="text-sm text-muted-foreground">
                {submissions.filter((s: any) => !s.corrige).length} à corriger
              </p>
            </div>
            
            <div className="grid gap-4">
              {submissions.length > 0 ? (
                submissions.map((submission: any) => (
                  <Card key={submission.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{submission.exercices?.titre}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{submission.exercices?.type}</span>
                            <span>Par: {submission.profiles?.prenom} {submission.profiles?.nom}</span>
                            <span>Le {new Date(submission.date_soumission).toLocaleDateString('fr-FR')}</span>
                            {submission.exercices?.groupes && (
                              <span className="px-2 py-0.5 bg-primary/10 rounded-full text-xs">
                                {submission.exercices.groupes.nom}
                              </span>
                            )}
                          </div>
                        </div>
                        {submission.corrige ? (
                          <Badge className="bg-success text-success-foreground">Corrigé</Badge>
                        ) : (
                          <Badge className="bg-warning text-warning-foreground">En attente</Badge>
                        )}
                      </div>

                      <div className="border-t pt-3">
                        <h4 className="font-semibold mb-2 text-sm">Réponses de l'étudiant:</h4>
                        <div className="space-y-2 bg-muted/50 p-3 rounded-lg">
                          {Object.entries(submission.reponses || {}).map(([qIndex, answer]: [string, any]) => (
                            <div key={qIndex} className="text-sm">
                              <span className="font-medium">Q{parseInt(qIndex) + 1}:</span>{' '}
                              {typeof answer === 'number' ? `Réponse ${answer + 1}` : answer}
                            </div>
                          ))}
                        </div>
                        {submission.fichiers_urls && submission.fichiers_urls.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium mb-1">Fichiers joints:</p>
                            {submission.fichiers_urls.map((url: string, idx: number) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline block"
                              >
                                Fichier {idx + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      {!submission.corrige && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="w-full" variant="outline">
                              Corriger et noter
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Correction - {submission.exercices?.titre}</DialogTitle>
                            </DialogHeader>
                            <form
                              onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const note = parseFloat(formData.get('note') as string);
                                const commentaire = formData.get('commentaire') as string;

                                try {
                                  const { error } = await supabase
                                    .from('exercice_submissions')
                                    .update({
                                      note,
                                      commentaire_prof: commentaire,
                                      corrige: true,
                                    })
                                    .eq('id', submission.id);

                                  if (error) throw error;

                                  toast({
                                    title: 'Succès',
                                    description: 'La soumission a été corrigée',
                                  });

                                  fetchData();
                                } catch (error: any) {
                                  toast({
                                    title: 'Erreur',
                                    description: error.message,
                                    variant: 'destructive',
                                  });
                                }
                              }}
                              className="space-y-4"
                            >
                              <div className="space-y-2">
                                <Label htmlFor="note">Note sur 20 *</Label>
                                <Input
                                  id="note"
                                  name="note"
                                  type="number"
                                  min="0"
                                  max="20"
                                  step="0.5"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="commentaire">Commentaire</Label>
                                <Textarea
                                  id="commentaire"
                                  name="commentaire"
                                  rows={4}
                                  placeholder="Vos remarques et conseils..."
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline">
                                  Annuler
                                </Button>
                                <Button type="submit">Enregistrer</Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      )}

                      {submission.corrige && (
                        <div className="border-t pt-3 bg-success/10 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">Note: {submission.note}/20</span>
                          </div>
                          {submission.commentaire_prof && (
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Commentaire:</span> {submission.commentaire_prof}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Aucune soumission pour le moment
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
