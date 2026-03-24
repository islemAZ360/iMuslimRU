import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, PrayerLog, AdhkarProgress } from '@/lib/supabase';
import { useProfile } from './useProfile';
import { DateTime } from 'luxon';

export type { PrayerLog };

export const useWorship = () => {
  const queryClient = useQueryClient();
  const { user } = useProfile();
  const today = DateTime.now().toFormat('yyyy-MM-dd');

  const { data: prayerLogs, isLoading: isPrayersLoading } = useQuery({
    queryKey: ['prayerLogs', user?.id, today],
    queryFn: async (): Promise<PrayerLog[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('prayer_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today);

      if (error) throw error;
      return (data || []) as PrayerLog[];
    },
    enabled: !!user,
  });

  const { data: adhkarProgress, isLoading: isAdhkarLoading } = useQuery({
    queryKey: ['adhkarProgress', user?.id, today],
    queryFn: async (): Promise<AdhkarProgress[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('adhkar_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today);

      if (error) throw error;
      return (data || []) as AdhkarProgress[];
    },
    enabled: !!user,
  });

  const logPrayer = useMutation({
    mutationFn: async (prayerName: string) => {
      if (!user) throw new Error('No user');

      const existing = prayerLogs?.find(l => l.prayer_name === prayerName);

      if (existing) {
        // Toggle off: delete the log
        const { error } = await supabase
          .from('prayer_logs')
          .delete()
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        // Log as completed
        const { error } = await supabase
          .from('prayer_logs')
          .insert({
            user_id: user.id,
            prayer_name: prayerName,
            date: today,
            status: 'completed',
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayerLogs', user?.id, today] });
    },
  });

  const logAdhkar = useMutation({
    mutationFn: async ({ dhikrId, count }: { dhikrId: string; count: number }) => {
      if (!user) throw new Error('No user');

      const existing = adhkarProgress?.find(p => p.dhikr_id === dhikrId);

      if (existing) {
        const { error } = await supabase
          .from('adhkar_progress')
          .update({ count, completed: true })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('adhkar_progress')
          .insert({
            user_id: user.id,
            dhikr_id: dhikrId,
            date: today,
            count,
            completed: true,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adhkarProgress', user?.id, today] });
    },
  });

  return {
    prayerLogs,
    adhkarProgress,
    isPrayersLoading,
    isAdhkarLoading,
    logPrayer,
    logAdhkar,
  };
};
