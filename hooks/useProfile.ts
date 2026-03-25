import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguageStore } from './useLanguage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { blink } from '@/lib/blink';

const USER_ID_KEY = 'imuslim_user_id';

// In-memory cache so userId is available synchronously after first async resolution.
// This eliminates the "No user" race condition when buttons are pressed before
// the async useQuery resolves the userId from AsyncStorage.
let CACHED_USER_ID: string | null = null;

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

// Generate or retrieve a persistent anonymous user ID.
// Also populates CACHED_USER_ID so subsequent renders have it synchronously.
async function getOrCreateUserId(): Promise<string> {
  // Return memory-cached value immediately (no AsyncStorage round-trip)
  if (CACHED_USER_ID) return CACHED_USER_ID;

  try {
    const existing = await AsyncStorage.getItem(USER_ID_KEY);
    if (existing) {
      CACHED_USER_ID = existing;
      return existing;
    }
    const newId = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    await AsyncStorage.setItem(USER_ID_KEY, newId);
    CACHED_USER_ID = newId;
    return newId;
  } catch {
    // Fallback: generate ephemeral ID if AsyncStorage fails
    const fallback = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    CACHED_USER_ID = fallback;
    return fallback;
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

      if (results.length > 0) {
        const p = results[0] as UserProfile;
        // Apply saved language preference from profile on load
        if (p.language) setLanguage(p.language as any);
        return p;
      }

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

  // Use the react-query resolved userId OR the in-memory cache for immediate availability.
  // This means: after the very first successful getOrCreateUserId(), `user` is non-null
  // on all subsequent renders — even before React Query re-hydrates the component.
  const effectiveUserId = userId ?? CACHED_USER_ID;
  const user = effectiveUserId ? { id: effectiveUserId } : null;

  return {
    user,
    profile,
    isLoading,
    updateProfile,
  };
};
