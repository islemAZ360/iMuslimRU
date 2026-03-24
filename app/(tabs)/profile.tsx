import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Container, Button, Card, Avatar } from '@/components/ui';
import { useI18n } from '@/lib/i18n';
import { colors, typography, spacing, borderRadius } from '@/constants/design';
import { useBlinkAuth } from '@blinkdotnew/react-native';
import { blink } from '@/lib/blink';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { t, language, setLanguage } = useI18n();
  const { user, isAuthenticated, isLoading } = useBlinkAuth();

  const { data: stats } = useQuery({
    queryKey: ['worship_stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const prayerCount = await blink.db.worshipStats.count({
        where: { userId: user.id, type: 'prayer' }
      });
      const adhkarCount = await blink.db.worshipStats.count({
        where: { userId: user.id, type: 'adhkar' }
      });
      return { prayers: prayerCount, adhkar: adhkarCount };
    },
    enabled: !!user,
  });

  const handleLogin = () => blink.auth.login();
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => blink.auth.signOut(), style: 'destructive' }
    ]);
  };

  return (
    <Container safeArea edges={['bottom']} padding="lg" style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('profile')}</Text>
        </View>

        {!isAuthenticated ? (
          <Card variant="elevated" style={styles.authCard}>
            <Card.Content style={styles.authContent}>
              <Ionicons name="person-circle" size={64} color={colors.textTertiary} />
              <Text style={styles.authTitle}>Join Muslim Russia</Text>
              <Text style={styles.authDesc}>Sign in to track your worship progress and sync data across devices.</Text>
              <Button variant="primary" style={styles.loginBtn} onPress={handleLogin}>
                Sign In
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <View style={styles.profileInfo}>
            <View style={styles.userRow}>
              <Avatar 
                source={user.avatar ? { uri: user.avatar } : undefined} 
                size="lg" 
                fallback={user.email?.charAt(0).toUpperCase()}
              />
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.displayName || 'Brother/Sister'}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <Card variant="outline" style={styles.statCard}>
                <Card.Content style={styles.statContent}>
                  <Text style={styles.statValue}>{stats?.prayers || 0}</Text>
                  <Text style={styles.statLabel}>Prayers Done</Text>
                </Card.Content>
              </Card>
              <Card variant="outline" style={styles.statCard}>
                <Card.Content style={styles.statContent}>
                  <Text style={styles.statValue}>{stats?.adhkar || 0}</Text>
                  <Text style={styles.statLabel}>Adhkar Done</Text>
                </Card.Content>
              </Card>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings')}</Text>
          <Card variant="outline" style={styles.settingsCard}>
            <Card.Content>
              <Text style={styles.settingLabel}>Language / Язык</Text>
              <View style={styles.langButtons}>
                <Button
                  variant={language === 'ar' ? 'primary' : 'outline'}
                  onPress={() => setLanguage('ar')}
                  style={styles.langButton}
                  size="sm"
                >
                  العربية
                </Button>
                <Button
                  variant={language === 'ru' ? 'primary' : 'outline'}
                  onPress={() => setLanguage('ru')}
                  style={styles.langButton}
                  size="sm"
                >
                  Русский
                </Button>
                <Button
                  variant={language === 'en' ? 'primary' : 'outline'}
                  onPress={() => setLanguage('en')}
                  style={styles.langButton}
                  size="sm"
                >
                  English
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>

        {isAuthenticated && (
          <Button 
            variant="outline" 
            danger 
            style={styles.logoutBtn} 
            onPress={handleLogout}
          >
            Sign Out
          </Button>
        )}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
  },
  authCard: {
    marginBottom: spacing.xl,
    borderRadius: borderRadius.xxl,
  },
  authContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  authTitle: {
    ...typography.h2,
    marginTop: spacing.md,
    color: colors.text,
  },
  authDesc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  loginBtn: {
    marginTop: spacing.xl,
    width: '100%',
  },
  profileInfo: {
    marginBottom: spacing.xxl,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...typography.h2,
    color: colors.text,
  },
  userEmail: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.xl,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statValue: {
    ...typography.h1,
    color: colors.primary,
  },
  statLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  settingsCard: {
    borderRadius: borderRadius.xl,
  },
  settingLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  langButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  langButton: {
    flex: 1,
  },
  logoutBtn: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
});
