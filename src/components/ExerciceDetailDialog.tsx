import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGamification } from '@/hooks/useGamification';
import { Upload, FileText, Download } from 'lucide-react';

interface ExerciceDetailDialogProps {
  exercice: {
    id: string;
    titre: string;
    type: string;
    duree: number;
    questions: any;
    fichier_url?: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSubmitSuccess: () => void;
}

export function ExerciceDetailDialog({ exercice, open, onOpenChange, userId, onSubmitSuccess }: ExerciceDetailDialogProps) {
  const { toast } = useToast();
  const { addXP } = useGamification();
  const [reponses, setReponses] = useState<Record<number, any>>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!exercice) return null;

  const questions = Array.isArray(exercice.questions) ? exercice.questions : [];

  const handleDownloadPDF = async () => {
    if (!exercice.fichier_url) return;
    
    try {
      setDownloading(true);
      
      // Fetch the file
      const response = await fetch(exercice.fichier_url);
      if (!response.ok) throw new Error('Erreur lors du téléchargement');
      
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${exercice.titre}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Téléchargement réussi',
        description: 'Le fichier a été téléchargé',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur de téléchargement',
        description: error.message || 'Impossible de télécharger le fichier',
        variant: 'destructive',
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleReponseChange = (questionIndex: number, value: any) => {
    setReponses(prev => ({
      ...prev,
      [questionIndex]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // Upload files if any
      const fileUrls: string[] = [];
      for (const file of uploadedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        fileUrls.push(publicUrl);
      }

      // Submit exercise
      const { error } = await supabase
        .from('exercice_submissions')
        .insert({
          exercice_id: exercice.id,
          etudiant_id: userId,
          reponses: reponses,
          fichiers_urls: fileUrls.length > 0 ? fileUrls : null,
        });

      if (error) throw error;

      // Award XP for submitting exercise
      await addXP(userId, 'exercice_soumis');

      toast({
        title: 'Succès',
        description: 'Votre soumission a été enregistrée',
      });

      setReponses({});
      setUploadedFiles([]);
      onOpenChange(false);
      onSubmitSuccess();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{exercice.titre}</DialogTitle>
          <div className="flex gap-4 text-sm text-muted-foreground mt-2">
            <span className="px-3 py-1 bg-primary/10 rounded-full capitalize">{exercice.type}</span>
            {exercice.duree && <span className="px-3 py-1 bg-secondary/10 rounded-full">{exercice.duree} min</span>}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Fichier PDF de l'exercice */}
          {exercice.fichier_url && (
            <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Fichier de l'exercice</h3>
                    <p className="text-sm text-muted-foreground">Téléchargez et résolvez l'exercice</p>
                  </div>
                </div>
                <Button 
                  onClick={handleDownloadPDF} 
                  variant="default"
                  disabled={downloading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloading ? 'Téléchargement...' : 'Télécharger le PDF'}
                </Button>
              </div>
            </div>
          )}

          {/* Questions inline (si présentes) */}
          {questions.length > 0 && (
            <>
              <h3 className="font-semibold text-lg">Questions</h3>
              {questions.map((q: any, index: number) => (
                <div key={index} className="p-4 bg-muted/50 rounded-lg border">
                  <Label className="text-base font-semibold mb-3 block">
                    Question {index + 1}: {q.question}
                  </Label>

                  {exercice.type === 'quiz' && Array.isArray(q.reponses) ? (
                    <RadioGroup
                      value={reponses[index]?.toString()}
                      onValueChange={(value) => handleReponseChange(index, parseInt(value))}
                    >
                      {q.reponses.map((rep: string, repIndex: number) => (
                        <div key={repIndex} className="flex items-center space-x-2 mb-2">
                          <RadioGroupItem value={repIndex.toString()} id={`q${index}-r${repIndex}`} />
                          <Label htmlFor={`q${index}-r${repIndex}`} className="cursor-pointer">
                            {rep}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <Textarea
                      value={reponses[index] || ''}
                      onChange={(e) => handleReponseChange(index, e.target.value)}
                      placeholder="Votre réponse..."
                      rows={4}
                      className="mt-2"
                    />
                  )}
                </div>
              ))}
            </>
          )}

          {/* Section de soumission PDF */}
          <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 bg-muted/30">
            <div className="text-center mb-4">
              <Upload className="h-10 w-10 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-lg">Soumettre votre travail</h3>
              <p className="text-sm text-muted-foreground">
                Uploadez le fichier PDF contenant votre exercice résolu
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {uploadedFiles.length > 0 && (
                <div className="bg-success/10 p-3 rounded-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-success" />
                  <span className="text-sm font-medium">{uploadedFiles.length} fichier(s) sélectionné(s)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || uploadedFiles.length === 0}
          >
            {submitting ? 'Soumission en cours...' : 'Soumettre mon travail'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
