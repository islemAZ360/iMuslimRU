import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProfile } from './useProfile';
import { DateTime } from 'luxon';
import { blink } from '@/lib/blink';

export interface PrayerLog {
  id: string;
  userId: string;
  prayerName: string;
  date: string;
  status: string;
  createdAt: string;
}

export interface AdhkarProgress {
  id: string;
  userId: string;
  dhikrId: string;
  date: string;
  count: number;
  completed: number;
  createdAt: string;
}

export const useWorship = () => {
  const queryClient = useQueryClient();
  const { user } = useProfile();
  const today = DateTime.now().toFormat('yyyy-MM-dd');

  const { data: prayerLogs, isLoading: isPrayersLoading } = useQuery({
    queryKey: ['prayerLogs', user?.id, today],
    queryFn: async (): Promise<PrayerLog[]> => {
      if (!user) return [];

      const results = await blink.db.prayerLogs.list({
        where: { userId: user.id, date: today },
      });

      return results as PrayerLog[];
    },
    enabled: !!user,
  });

  const { data: adhkarProgress, isLoading: isAdhkarLoading } = useQuery({
    queryKey: ['adhkarProgress', user?.id, today],
    queryFn: async (): Promise<AdhkarProgress[]> => {
      if (!user) return [];

      const results = await blink.db.adhkarProgress.list({
        where: { userId: user.id, date: today },
      });

      return results as AdhkarProgress[];
    },
    enabled: !!user,
  });

  const logPrayer = useMutation({
    mutationFn: async (prayerName: string) => {
      if (!user) throw new Error('No user');

      const existing = prayerLogs?.find(l => l.prayerName === prayerName);

      if (existing) {
        // Toggle off: delete the log
        await blink.db.prayerLogs.delete(existing.id);
      } else {
        // Log as completed
        await blink.db.prayerLogs.create({
          userId: user.id,
          prayerName,
          date: today,
          status: 'completed',
          createdAt: new Date().toISOString(),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayerLogs', user?.id, today] });
    },
  });

  const logAdhkar = useMutation({
    mutationFn: async ({ dhikrId, count }: { dhikrId: string; count: number }) => {
      if (!user) throw new Error('No user');

      const existing = adhkarProgress?.find(p => p.dhikrId === dhikrId);

      if (existing) {
        await blink.db.adhkarProgress.update(existing.id, {
          count,
          completed: 1,
        });
      } else {
        await blink.db.adhkarProgress.create({
          userId: user.id,
          dhikrId,
          date: today,
          count,
          completed: 1,
          createdAt: new Date().toISOString(),
        });
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
