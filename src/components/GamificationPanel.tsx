import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  Trophy, Star, Flame, Zap, Award, Target, 
  BookOpen, Brain, GraduationCap, Sparkles,
  Calendar, Footprints, Lightbulb
} from 'lucide-react';

interface Badge {
  id: string;
  nom: string;
  description: string;
  icone: string;
  condition_type: string;
  condition_value: number;
  xp_reward: number;
}

interface UserBadge {
  id: string;
  badge_id: string;
  date_obtention: string;
  badges: Badge;
}

interface UserGamification {
  xp_total: number;
  niveau: number;
  streak_actuel: number;
  meilleur_streak: number;
  cours_suivis: number;
  exercices_completes: number;
  notes_parfaites: number;
}

interface Leaderboard {
  user_id: string;
  xp_total: number;
  niveau: number;
  nom: string;
  prenom: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'footprints': Footprints,
  'calendar-check': Calendar,
  'trophy': Trophy,
  'lightbulb': Lightbulb,
  'brain': Brain,
  'graduation-cap': GraduationCap,
  'flame': Flame,
  'fire': Flame,
  'zap': Zap,
  'star': Star,
  'sparkles': Sparkles,
};

export function GamificationPanel({ userId }: { userId: string }) {
  const [gamification, setGamification] = useState<UserGamification | null>(null);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGamificationData();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('gamification-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_gamification',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchGamificationData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchGamificationData = async () => {
    try {
      // Fetch or create user gamification
      let { data: gamData } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!gamData) {
        const { data: newGam } = await supabase
          .from('user_gamification')
          .insert({ user_id: userId })
          .select()
          .single();
        gamData = newGam;
      }

      setGamification(gamData);

      // Fetch all badges
      const { data: badges } = await supabase
        .from('badges')
        .select('*')
        .order('condition_value', { ascending: true });

      setAllBadges(badges || []);

      // Fetch user badges
      const { data: uBadges } = await supabase
        .from('user_badges')
        .select('*, badges(*)')
        .eq('user_id', userId);

      setUserBadges(uBadges || []);

      // Fetch leaderboard (top 10)
      const { data: leaderboardData } = await supabase
        .from('user_gamification')
        .select('user_id, xp_total, niveau')
        .order('xp_total', { ascending: false })
        .limit(10);

      if (leaderboardData) {
        // Fetch profile names
        const userIds = leaderboardData.map(l => l.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, nom, prenom')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        
        const leaderboardWithNames = leaderboardData.map(l => ({
          ...l,
          nom: profileMap.get(l.user_id)?.nom || 'Inconnu',
          prenom: profileMap.get(l.user_id)?.prenom || '',
        }));

        setLeaderboard(leaderboardWithNames);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
      setLoading(false);
    }
  };

  const getXpForNextLevel = (level: number) => level * 500;
  
  const getXpProgress = () => {
    if (!gamification) return 0;
    const xpForLevel = getXpForNextLevel(gamification.niveau);
    const xpInCurrentLevel = gamification.xp_total % xpForLevel;
    return (xpInCurrentLevel / xpForLevel) * 100;
  };

  const getBadgeProgress = (badge: Badge) => {
    if (!gamification) return 0;
    let current = 0;
    switch (badge.condition_type) {
      case 'cours_suivis':
        current = gamification.cours_suivis;
        break;
      case 'exercices_completes':
        current = gamification.exercices_completes;
        break;
      case 'streak':
        current = gamification.meilleur_streak;
        break;
      case 'note_parfaite':
        current = gamification.notes_parfaites;
        break;
    }
    return Math.min((current / badge.condition_value) * 100, 100);
  };

  const isBadgeUnlocked = (badgeId: string) => {
    return userBadges.some(ub => ub.badge_id === badgeId);
  };

  const getUserRank = () => {
    const index = leaderboard.findIndex(l => l.user_id === userId);
    return index >= 0 ? index + 1 : '-';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Gamification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="classement">Classement</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="mt-4 space-y-4">
            {/* Level & XP */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                    {gamification?.niveau || 1}
                  </div>
                  <div>
                    <p className="font-semibold">Niveau {gamification?.niveau || 1}</p>
                    <p className="text-sm text-muted-foreground">{gamification?.xp_total || 0} XP total</p>
                  </div>
                </div>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
              <Progress value={getXpProgress()} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {getXpForNextLevel(gamification?.niveau || 1) - ((gamification?.xp_total || 0) % getXpForNextLevel(gamification?.niveau || 1))} XP pour le niveau suivant
              </p>
            </div>

            {/* Streak */}
            <div className="flex items-center justify-between p-4 bg-orange-500/10 rounded-lg">
              <div className="flex items-center gap-3">
                <Flame className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="font-semibold">{gamification?.streak_actuel || 0} jours</p>
                  <p className="text-sm text-muted-foreground">Streak actuel</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{gamification?.meilleur_streak || 0}</p>
                <p className="text-xs text-muted-foreground">Meilleur</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <BookOpen className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                <p className="font-bold">{gamification?.cours_suivis || 0}</p>
                <p className="text-xs text-muted-foreground">Cours</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Brain className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                <p className="font-bold">{gamification?.exercices_completes || 0}</p>
                <p className="text-xs text-muted-foreground">Exercices</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Star className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                <p className="font-bold">{gamification?.notes_parfaites || 0}</p>
                <p className="text-xs text-muted-foreground">Parfaits</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="badges" className="mt-4">
            <div className="grid grid-cols-3 gap-3">
              {allBadges.map((badge) => {
                const unlocked = isBadgeUnlocked(badge.id);
                const IconComponent = iconMap[badge.icone] || Award;
                const progress = getBadgeProgress(badge);

                return (
                  <div
                    key={badge.id}
                    className={`relative p-3 rounded-lg border-2 transition-all ${
                      unlocked 
                        ? 'border-primary bg-primary/10' 
                        : 'border-muted bg-muted/30 opacity-60'
                    }`}
                    title={`${badge.nom}: ${badge.description}`}
                  >
                    <div className="text-center">
                      <IconComponent 
                        className={`h-8 w-8 mx-auto mb-1 ${
                          unlocked ? 'text-primary' : 'text-muted-foreground'
                        }`} 
                      />
                      <p className="text-xs font-medium truncate">{badge.nom}</p>
                      {!unlocked && (
                        <Progress value={progress} className="h-1 mt-1" />
                      )}
                      {unlocked && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          +{badge.xp_reward} XP
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="classement" className="mt-4">
            <div className="space-y-2">
              {/* Current User Rank */}
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border-2 border-primary">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg w-8">#{getUserRank()}</span>
                  <span className="font-medium">Vous</span>
                </div>
                <span className="font-bold">{gamification?.xp_total || 0} XP</span>
              </div>

              {/* Leaderboard */}
              {leaderboard.map((entry, index) => (
                <div 
                  key={entry.user_id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    entry.user_id === userId ? 'bg-primary/10' : 'bg-muted/50'
                  } ${index < 3 ? 'border-l-4' : ''} ${
                    index === 0 ? 'border-l-yellow-500' : 
                    index === 1 ? 'border-l-gray-400' : 
                    index === 2 ? 'border-l-amber-600' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-bold w-8 ${
                      index === 0 ? 'text-yellow-500' :
                      index === 1 ? 'text-gray-400' :
                      index === 2 ? 'text-amber-600' : ''
                    }`}>
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{entry.prenom} {entry.nom.charAt(0)}.</p>
                      <p className="text-xs text-muted-foreground">Niveau {entry.niveau}</p>
                    </div>
                  </div>
                  <span className="font-bold">{entry.xp_total} XP</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
