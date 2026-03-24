import { View, Text, StyleSheet } from 'react-native';
import { Container } from '@/components/ui';
import { useI18n } from '@/lib/i18n';
import { colors, typography, spacing } from '@/constants/design';

export default function QiblaScreen() {
  const { t } = useI18n();

  return (
    <Container safeArea edges={['bottom']} padding="lg">
      <View style={styles.header}>
        <Text style={styles.title}>{t('qibla')}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.placeholder}>Qibla Direction Compass</Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
