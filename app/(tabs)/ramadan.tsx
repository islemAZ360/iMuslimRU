import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Container } from '@/components/ui';
import { colors, spacing, typography, shadows, borderRadius } from '@/constants/design';
import { useLanguageStore } from '@/hooks/useLanguage';
import { translations } from '@/constants/translations';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { DateTime } from 'luxon';

export default function Ramadan() {
  const { language } = useLanguageStore();
  const t = translations[language].ramadan;
  const [times, setTimes] = useState<{ fajr: string, maghrib: string } | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const [isFasting, setIsFasting] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let loc = await Location.getCurrentPositionAsync({});
      
      const coordinates = new Coordinates(loc.coords.latitude, loc.coords.longitude);
      const params = CalculationMethod.MuslimWorldLeague();
      const date = new Date();
      const prayerTimes = new PrayerTimes(coordinates, date, params);

      setTimes({
        fajr: DateTime.fromJSDate(prayerTimes.fajr).toFormat('HH:mm'),
        maghrib: DateTime.fromJSDate(prayerTimes.maghrib).toFormat('HH:mm')
      });
    })();
  }, []);

  useEffect(() => {
    if (!times) return;

    const timer = setInterval(() => {
      const now = DateTime.now();
      const maghrib = DateTime.fromFormat(times.maghrib, 'HH:mm');
      const fajr = DateTime.fromFormat(times.fajr, 'HH:mm');
      
      let target;
      if (now < maghrib && now > fajr) {
        setIsFasting(true);
        target = maghrib;
      } else {
        setIsFasting(false);
        target = now > maghrib ? fajr.plus({ days: 1 }) : fajr;
      }

      const diff = target.diff(now, ['hours', 'minutes', 'seconds']);
      setCountdown(diff.toFormat('hh:mm:ss'));
    }, 1000);

    return () => clearInterval(timer);
  }, [times]);

  const duas = [
    {
      title: language === 'ru' ? 'Дуа при ифтаре' : 'Dua for Iftar',
      arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ',
      translation: language === 'ru' ? 'Ушла жажда, наполнились жилы влагой, и утвердилась награда, если пожелает Аллах.' : 'The thirst is gone, the veins are moistened and the reward is confirmed, if Allah wills.'
    },
    {
      title: language === 'ru' ? 'Дуа перед постом' : 'Dua for starting fast',
      arabic: 'وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ',
      translation: language === 'ru' ? 'Я намерился поститься завтра в месяце Рамадан.' : 'I intend to keep the fast for tomorrow in the month of Ramadan.'
    }
  ];

  return (
    <Container style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{t.title}</Text>
        
        <View style={styles.mainCard}>
          <Ionicons name="moon" size={48} color={colors.accent} />
          <Text style={styles.countdownTitle}>
            {isFasting ? t.untilIftar : t.untilSuhoor}
          </Text>
          <Text style={styles.countdown}>{countdown || '00:00:00'}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{t.suhoor}</Text>
            <Text style={styles.time}>{times?.fajr || '--:--'}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{t.iftar}</Text>
            <Text style={styles.time}>{times?.maghrib || '--:--'}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t.duas}</Text>
        {duas.map((dua, index) => (
          <View key={index} style={styles.duaCard}>
            <Text style={styles.duaTitle}>{dua.title}</Text>
            <Text style={styles.duaArabic}>{dua.arabic}</Text>
            <Text style={styles.duaTranslation}>{dua.translation}</Text>
          </View>
        ))}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  mainCard: {
    backgroundColor: colors.primary,
    padding: spacing.xxl,
    borderRadius: 32,
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  countdownTitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.md,
  },
  countdown: {
    ...typography.h1,
    fontSize: 42,
    color: colors.white,
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  card: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    ...shadows.sm,
  },
  cardLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  time: {
    ...typography.h2,
    color: colors.primary,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  duaCard: {
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: 20,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  duaTitle: {
    ...typography.h4,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  duaArabic: {
    ...typography.h3,
    textAlign: 'right',
    color: colors.text,
    marginBottom: spacing.md,
    lineHeight: 32,
  },
  duaTranslation: {
    ...typography.body,
    color: colors.textSecondary,
  },
});

