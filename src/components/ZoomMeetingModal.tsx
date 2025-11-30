import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface ZoomMeetingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingUrl: string;
  coursTitle: string;
}

export const ZoomMeetingModal = ({ 
  open, 
  onOpenChange, 
  meetingUrl, 
  coursTitle 
}: ZoomMeetingModalProps) => {
  // Extraire le meeting ID de l'URL Zoom
  const getMeetingId = (url: string) => {
    const match = url.match(/\/j\/(\d+)/);
    return match ? match[1] : '';
  };

  // Construire l'URL d'embed Zoom
  const meetingId = getMeetingId(meetingUrl);
  const embedUrl = meetingId 
    ? `https://zoom.us/wc/${meetingId}/join`
    : meetingUrl;

  const handleOpenInNewWindow = () => {
    window.open(meetingUrl, '_blank', 'width=1200,height=800');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{coursTitle}</DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewWindow}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ouvrir dans une nouvelle fenêtre
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 p-6 pt-4">
          <div className="relative w-full h-full bg-muted rounded-lg overflow-hidden">
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full border-0"
              allow="camera; microphone; display-capture; fullscreen"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
              title={`Zoom Meeting - ${coursTitle}`}
            />
          </div>
        </div>

        <div className="p-6 pt-0 text-sm text-muted-foreground">
          <p>💡 Astuce: Si la réunion ne se charge pas, utilisez le bouton "Ouvrir dans une nouvelle fenêtre" ci-dessus.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
