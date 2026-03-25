import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguageStore } from './useLanguage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { blink } from '@/lib/blink';

const USER_ID_KEY = 'imuslim_user_id';

export interface UserProfile {
  id: string;
  userId: string;
  city: string;
  language: string;
  calculationMethod: string;
  prayerAlerts: number;
  adhkarReminders: number;
  createdAt: string;
  updatedAt: string;
}

// Generate or retrieve a persistent anonymous user ID
async function getOrCreateUserId(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(USER_ID_KEY);
    if (existing) return existing;
    const newId = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    await AsyncStorage.setItem(USER_ID_KEY, newId);
    return newId;
  } catch {
    return `anon_${Date.now()}`;
  }
}

export const useProfile = () => {
  const queryClient = useQueryClient();
  const { setLanguage } = useLanguageStore();

  const { data: userId } = useQuery({
    queryKey: ['userId'],
    queryFn: getOrCreateUserId,
    staleTime: Infinity,
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!userId) return null;

      const results = await blink.db.userProfiles.list({
        where: { userId },
        limit: 1,
      });

      if (results.length > 0) return results[0] as UserProfile;

      // Profile doesn't exist — create default
      const created = await blink.db.userProfiles.create({
        userId,
        city: 'Moscow',
        language: 'ru',
        calculationMethod: 'MuslimWorldLeague',
        prayerAlerts: 1,
        adhkarReminders: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return created as UserProfile;
    },
    enabled: !!userId,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!profile?.id) throw new Error('No profile ID');

      const updated = await blink.db.userProfiles.update(profile.id, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      if (updates.language) {
        setLanguage(updates.language as any);
      }

      return updated as UserProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });

  const user = userId ? { id: userId } : null;

  return {
    user,
    profile,
    isLoading,
    updateProfile,
  };
};
