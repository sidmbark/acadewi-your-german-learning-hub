import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StudentFeedbackProps {
  studentId: string;
  studentName: string;
}

export function StudentFeedback({ studentId, studentName }: StudentFeedbackProps) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir un commentaire',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create a notification for the student with the feedback
      const { error } = await supabase.from('notifications').insert({
        user_id: studentId,
        type: 'feedback_professeur',
        message: `Nouveau commentaire de votre professeur: ${feedback}`,
        lu: false,
      });

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Votre commentaire a été envoyé à l\'étudiant',
      });

      setFeedback('');
      setOpen(false);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <MessageSquare className="h-4 w-4 mr-1" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un commentaire pour {studentName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback">Votre commentaire</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Ajoutez vos observations, encouragements ou recommandations pour cet étudiant..."
              rows={5}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Envoi...' : 'Envoyer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
