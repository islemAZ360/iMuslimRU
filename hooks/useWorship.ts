import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blink } from '@/lib/blink';
import { useProfile } from './useProfile';
import { DateTime } from 'luxon';

export interface PrayerLog {
  id: string;
  userId: string;
  prayerName: string;
  date: string;
  status: 'completed' | 'missed';
}

export const useWorship = () => {
  const queryClient = useQueryClient();
  const { user } = useProfile();
  const today = DateTime.now().toFormat('yyyy-MM-dd');

  const { data: prayerLogs, isLoading: isPrayersLoading } = useQuery({
    queryKey: ['prayerLogs', user?.id, today],
    queryFn: async () => {
      if (!user) return [];
      const logs = await blink.db.prayerLogs.list({
        where: {
          userId: user.id,
          date: today,
        },
      });
      return logs as PrayerLog[];
    },
    enabled: !!user,
  });

  const { data: adhkarProgress, isLoading: isAdhkarLoading } = useQuery({
    queryKey: ['adhkarProgress', user?.id, today],
    queryFn: async () => {
      if (!user) return [];
      const progress = await blink.db.adhkarProgress.list({
        where: {
          userId: user.id,
          date: today,
        },
      });
      return progress;
    },
    enabled: !!user,
  });

  const logPrayer = useMutation({
    mutationFn: async (prayerName: string) => {
      if (!user) throw new Error('No user');
      
      const existing = prayerLogs?.find(l => l.prayerName === prayerName);
      if (existing) {
        // Toggle: remove if already exists (or update status)
        // For now, let's just delete it to mark as not completed
        return await blink.db.prayerLogs.delete(existing.id);
      } else {
        return await blink.db.prayerLogs.create({
          userId: user.id,
          prayerName,
          date: today,
          status: 'completed',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayerLogs', user?.id, today] });
    },
  });

  return {
    prayerLogs,
    adhkarProgress,
    isPrayersLoading,
    isAdhkarLoading,
    logPrayer,
  };
};
