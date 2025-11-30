import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText } from 'lucide-react';

interface ExerciceDetailDialogProps {
  exercice: {
    id: string;
    titre: string;
    type: string;
    duree: number;
    questions: any;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSubmitSuccess: () => void;
}

export function ExerciceDetailDialog({ exercice, open, onOpenChange, userId, onSubmitSuccess }: ExerciceDetailDialogProps) {
  const { toast } = useToast();
  const [reponses, setReponses] = useState<Record<number, any>>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  if (!exercice) return null;

  const questions = Array.isArray(exercice.questions) ? exercice.questions : [];

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
            <span className="px-3 py-1 bg-primary/10 rounded-full">{exercice.type}</span>
            {exercice.duree && <span className="px-3 py-1 bg-secondary/10 rounded-full">{exercice.duree} min</span>}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
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

          <div className="border-t pt-4">
            <Label className="text-base font-semibold mb-3 block">
              <FileText className="inline mr-2 h-4 w-4" />
              Fichiers supplémentaires (optionnel)
            </Label>
            <div className="flex flex-col gap-3">
              <Input
                type="file"
                multiple
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {uploadedFiles.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {uploadedFiles.length} fichier(s) sélectionné(s)
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Soumission...' : 'Soumettre'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
