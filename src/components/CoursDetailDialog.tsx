import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Video } from "lucide-react";

interface CoursDetailDialogProps {
  cours: {
    id: string;
    titre: string;
    description: string;
    date: string;
    heure: string;
    lien_zoom: string;
    groupes: {
      nom: string;
      niveau: string;
    };
    professorInfo?: {
      nom: string;
      prenom: string;
    } | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canJoin: boolean;
  onJoinZoom: () => void;
}

export function CoursDetailDialog({
  cours,
  open,
  onOpenChange,
  canJoin,
  onJoinZoom,
}: CoursDetailDialogProps) {
  if (!cours) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{cours.titre}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Description</h3>
            <p className="text-foreground">
              {cours.description || "Aucune description disponible"}
            </p>
          </div>

          {/* Informations du cours */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(cours.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Heure</p>
                  <p className="font-medium">{cours.heure}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {cours.professorInfo && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Professeur</p>
                    <p className="font-medium">
                      {cours.professorInfo.prenom} {cours.professorInfo.nom}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Video className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Groupe</p>
                  <Badge variant="secondary">
                    {cours.groupes.nom} - {cours.groupes.niveau}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            {canJoin ? (
              <Button
                onClick={onJoinZoom}
                className="flex-1"
                size="lg"
              >
                <Video className="mr-2 h-5 w-5" />
                Rejoindre le cours sur Zoom
              </Button>
            ) : (
              <Button disabled className="flex-1" size="lg">
                Le cours n'est pas encore disponible
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
