import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Book, Search, Volume2, Star, History, Loader2, X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DictionaryEntry {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  gender?: string;
  plural?: string;
  translation: string;
  examples: { german: string; french: string }[];
  conjugation?: string[];
}

export function GermanDictionary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<DictionaryEntry[]>([]);
  const [searching, setSearching] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('german-dict-favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const { toast } = useToast();

  const searchWord = async () => {
    if (!searchTerm.trim()) return;

    setSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('german-dictionary', {
        body: { word: searchTerm.trim() }
      });

      if (error) throw error;

      if (data?.entries) {
        setResults(data.entries);
        // Add to history
        setSearchHistory(prev => {
          const newHistory = [searchTerm, ...prev.filter(w => w !== searchTerm)].slice(0, 10);
          return newHistory;
        });
      } else {
        setResults([]);
        toast({
          title: 'Mot non trouvé',
          description: `"${searchTerm}" n'a pas été trouvé dans le dictionnaire`,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Dictionary search error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de rechercher le mot',
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  };

  const playPronunciation = async (word: string) => {
    setPlayingAudio(word);
    try {
      // Try to use browser's built-in speech synthesis first
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'de-DE';
        utterance.rate = 0.8;
        
        // Find German voice if available
        const voices = speechSynthesis.getVoices();
        const germanVoice = voices.find(v => v.lang.startsWith('de'));
        if (germanVoice) {
          utterance.voice = germanVoice;
        }
        
        utterance.onend = () => setPlayingAudio(null);
        utterance.onerror = () => setPlayingAudio(null);
        
        speechSynthesis.speak(utterance);
      } else {
        toast({
          title: 'Non supporté',
          description: 'La synthèse vocale n\'est pas supportée par votre navigateur',
          variant: 'destructive',
        });
        setPlayingAudio(null);
      }
    } catch (error: any) {
      console.error('TTS error:', error);
      setPlayingAudio(null);
      toast({
        title: 'Erreur',
        description: 'Service de prononciation indisponible',
        variant: 'destructive',
      });
    }
  };

  const toggleFavorite = (word: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(word)
        ? prev.filter(w => w !== word)
        : [...prev, word];
      localStorage.setItem('german-dict-favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const handleHistoryClick = (word: string) => {
    setSearchTerm(word);
    searchWord();
  };

  const clearResults = () => {
    setResults([]);
    setSearchTerm('');
  };

  return (
    <Card className="border-2 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Book className="h-5 w-5 text-primary" />
          Dictionnaire Allemand
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un mot allemand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchWord()}
              className="pl-9"
            />
          </div>
          <Button onClick={searchWord} disabled={searching}>
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Rechercher'}
          </Button>
        </div>

        {/* History & Favorites */}
        {!results.length && (
          <div className="space-y-4">
            {favorites.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" /> Favoris
                </p>
                <div className="flex flex-wrap gap-2">
                  {favorites.map(word => (
                    <Badge 
                      key={word} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => {
                        setSearchTerm(word);
                        searchWord();
                      }}
                    >
                      {word}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {searchHistory.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-1">
                  <History className="h-4 w-4" /> Historique
                </p>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map(word => (
                    <Badge 
                      key={word} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => handleHistoryClick(word)}
                    >
                      {word}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {!favorites.length && !searchHistory.length && (
              <div className="text-center py-8 text-muted-foreground">
                <Book className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Recherchez un mot allemand pour commencer</p>
                <p className="text-sm mt-1">Exemples: Haus, gehen, schön</p>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearResults}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" /> Fermer les résultats
              </Button>

              {results.map((entry, index) => (
                <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-3">
                  {/* Word Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold">{entry.word}</h3>
                        {entry.gender && (
                          <Badge variant="outline" className={
                            entry.gender === 'der' ? 'border-blue-500 text-blue-500' :
                            entry.gender === 'die' ? 'border-pink-500 text-pink-500' :
                            'border-green-500 text-green-500'
                          }>
                            {entry.gender}
                          </Badge>
                        )}
                        <Badge variant="secondary">{entry.partOfSpeech}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.phonetic}</p>
                      {entry.plural && (
                        <p className="text-sm">Pluriel: <span className="font-medium">{entry.plural}</span></p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => playPronunciation(entry.word)}
                        disabled={playingAudio === entry.word}
                      >
                        {playingAudio === entry.word ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(entry.word)}
                      >
                        <Star className={`h-4 w-4 ${
                          favorites.includes(entry.word) ? 'fill-yellow-500 text-yellow-500' : ''
                        }`} />
                      </Button>
                    </div>
                  </div>

                  {/* Translation */}
                  <div className="p-3 bg-background rounded border">
                    <p className="font-medium">{entry.translation}</p>
                  </div>

                  {/* Examples */}
                  {entry.examples.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Exemples:</p>
                      {entry.examples.map((ex, i) => (
                        <div key={i} className="pl-3 border-l-2 border-primary/30">
                          <p className="font-medium text-sm">{ex.german}</p>
                          <p className="text-sm text-muted-foreground">{ex.french}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Conjugation */}
                  {entry.conjugation && entry.conjugation.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Conjugaison (présent):</p>
                      <div className="flex flex-wrap gap-1">
                        {entry.conjugation.map((conj, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {conj}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
