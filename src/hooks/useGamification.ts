import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface XPReward {
  amount: number;
  reason: string;
}

const XP_REWARDS: Record<string, XPReward> = {
  cours_assiste: { amount: 25, reason: 'Participation à un cours' },
  exercice_soumis: { amount: 30, reason: 'Soumission d\'exercice' },
  exercice_corrige: { amount: 20, reason: 'Exercice corrigé' },
  note_parfaite: { amount: 100, reason: 'Note parfaite obtenue!' },
  connexion_quotidienne: { amount: 10, reason: 'Connexion quotidienne' },
  premier_exercice: { amount: 50, reason: 'Premier exercice complété' },
};

export function useGamification() {
  const { toast } = useToast();

  const addXP = async (userId: string, type: keyof typeof XP_REWARDS) => {
    const reward = XP_REWARDS[type];
    if (!reward) return;

    try {
      // Get or create user gamification record
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

      if (!gamData) return;

      const newXP = gamData.xp_total + reward.amount;
      const newLevel = Math.floor(newXP / 500) + 1;
      const leveledUp = newLevel > gamData.niveau;

      // Update stats based on type
      const updates: Record<string, any> = {
        xp_total: newXP,
        niveau: newLevel,
      };

      if (type === 'cours_assiste') {
        updates.cours_suivis = gamData.cours_suivis + 1;
      } else if (type === 'exercice_soumis' || type === 'exercice_corrige') {
        updates.exercices_completes = gamData.exercices_completes + 1;
      } else if (type === 'note_parfaite') {
        updates.notes_parfaites = gamData.notes_parfaites + 1;
      }

      // Update streak
      const today = new Date().toISOString().split('T')[0];
      if (gamData.derniere_activite !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (gamData.derniere_activite === yesterdayStr) {
          updates.streak_actuel = gamData.streak_actuel + 1;
          if (updates.streak_actuel > gamData.meilleur_streak) {
            updates.meilleur_streak = updates.streak_actuel;
          }
        } else {
          updates.streak_actuel = 1;
        }
        updates.derniere_activite = today;
      }

      // Update user gamification
      await supabase
        .from('user_gamification')
        .update(updates)
        .eq('user_id', userId);

      // Log XP history
      await supabase.from('xp_history').insert({
        user_id: userId,
        xp_gagne: reward.amount,
        raison: reward.reason,
      });

      // Check for new badges
      await checkAndAwardBadges(userId, updates);

      // Show toast notification
      toast({
        title: `+${reward.amount} XP`,
        description: reward.reason,
        duration: 3000,
      });

      if (leveledUp) {
        toast({
          title: '🎉 Niveau supérieur!',
          description: `Félicitations! Vous êtes maintenant niveau ${newLevel}`,
          duration: 5000,
        });
      }

    } catch (error) {
      console.error('Error adding XP:', error);
    }
  };

  const checkAndAwardBadges = async (userId: string, stats: Record<string, any>) => {
    try {
      // Get all badges
      const { data: allBadges } = await supabase
        .from('badges')
        .select('*');

      if (!allBadges) return;

      // Get user's current badges
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', userId);

      const userBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || []);

      // Check each badge
      for (const badge of allBadges) {
        if (userBadgeIds.has(badge.id)) continue; // Already has this badge

        let earned = false;
        const value = stats[badge.condition_type] || 0;

        switch (badge.condition_type) {
          case 'cours_suivis':
            earned = value >= badge.condition_value;
            break;
          case 'exercices_completes':
            earned = value >= badge.condition_value;
            break;
          case 'streak':
            earned = (stats.streak_actuel || stats.meilleur_streak || 0) >= badge.condition_value;
            break;
          case 'note_parfaite':
            earned = value >= badge.condition_value;
            break;
        }

        if (earned) {
          // Award badge
          await supabase.from('user_badges').insert({
            user_id: userId,
            badge_id: badge.id,
          });

          // Add bonus XP for badge
          await supabase
            .from('user_gamification')
            .update({ 
              xp_total: supabase.rpc ? stats.xp_total + badge.xp_reward : stats.xp_total 
            })
            .eq('user_id', userId);

          // Log XP history
          await supabase.from('xp_history').insert({
            user_id: userId,
            xp_gagne: badge.xp_reward,
            raison: `Badge débloqué: ${badge.nom}`,
          });

          toast({
            title: '🏆 Nouveau badge!',
            description: `Vous avez débloqué "${badge.nom}" (+${badge.xp_reward} XP)`,
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error('Error checking badges:', error);
    }
  };

  const recordDailyLogin = async (userId: string) => {
    try {
      const { data: gamData } = await supabase
        .from('user_gamification')
        .select('derniere_activite')
        .eq('user_id', userId)
        .single();

      const today = new Date().toISOString().split('T')[0];
      
      if (!gamData || gamData.derniere_activite !== today) {
        await addXP(userId, 'connexion_quotidienne');
      }
    } catch (error) {
      console.error('Error recording daily login:', error);
    }
  };

  return {
    addXP,
    recordDailyLogin,
  };
}
