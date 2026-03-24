import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, UserProfile } from '@/lib/supabase';
import { useLanguageStore } from './useLanguage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID_KEY = 'imuslim_user_id';

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

export { UserProfile };

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

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create default
        const defaultProfile = {
          user_id: userId,
          city: 'Moscow',
          language: 'ru',
          calculation_method: 'MuslimWorldLeague',
          prayer_alerts: 1,
          adhkar_reminders: 1,
        };
        const { data: created, error: createError } = await supabase
          .from('user_profiles')
          .insert(defaultProfile)
          .select()
          .single();

        if (createError) throw createError;
        return created as UserProfile;
      }

      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!userId,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!userId) throw new Error('No user ID');

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      if (updates.language) {
        setLanguage(updates.language as any);
      }

      return data as UserProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });

  // Expose a compatible `user` object with an `id` field for useWorship
  const user = userId ? { id: userId } : null;

  return {
    user,
    profile,
    isLoading,
    updateProfile,
  };
};
