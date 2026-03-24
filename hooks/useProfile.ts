import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blink } from '@/lib/blink';
import { useLanguageStore } from './useLanguage';

export interface UserProfile {
  userId: string;
  displayName: string | null;
  city: string;
  language: string;
  calculationMethod: string;
  prayerAlerts: number;
  adhkarReminders: number;
}

export const useProfile = () => {
  const queryClient = useQueryClient();
  const { setLanguage } = useLanguageStore();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { user } = await blink.auth.getUser();
      if (!user) {
        // Sign in anonymously if no user
        const { user: newUser } = await blink.auth.signUpAnonymous();
        return newUser;
      }
      return user;
    },
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const result = await blink.db.userProfiles.get(user.id);
      if (!result) {
        // Create default profile
        const defaultProfile = {
          userId: user.id,
          city: 'Moscow',
          language: 'ru',
          calculationMethod: 'MuslimWorldLeague',
          prayerAlerts: 1,
          adhkarReminders: 1,
        };
        return await blink.db.userProfiles.create(defaultProfile) as UserProfile;
      }
      return result as UserProfile;
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!user) throw new Error('No user');
      const result = await blink.db.userProfiles.update(user.id, updates);
      if (updates.language) {
        setLanguage(updates.language as any);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });

  return {
    user,
    profile,
    isLoading,
    updateProfile,
  };
};
