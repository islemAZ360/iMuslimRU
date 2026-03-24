import { View, Text, StyleSheet } from 'react-native';
import { Container, Button } from '@/components/ui';
import { useI18n } from '@/lib/i18n';
import { colors, typography, spacing } from '@/constants/design';

export default function ProfileScreen() {
  const { t, language, setLanguage } = useI18n();

  return (
    <Container safeArea edges={['bottom']} padding="lg">
      <View style={styles.header}>
        <Text style={styles.title}>{t('profile')}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings')}</Text>
        <View style={styles.langButtons}>
          <Button
            variant={language === 'ar' ? 'primary' : 'outline'}
            onPress={() => setLanguage('ar')}
            style={styles.langButton}
          >
            العربية
          </Button>
          <Button
            variant={language === 'ru' ? 'primary' : 'outline'}
            onPress={() => setLanguage('ru')}
            style={styles.langButton}
          >
            Русский
          </Button>
          <Button
            variant={language === 'en' ? 'primary' : 'outline'}
            onPress={() => setLanguage('en')}
            style={styles.langButton}
          >
            English
          </Button>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  langButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  langButton: {
    flex: 1,
  },
});
