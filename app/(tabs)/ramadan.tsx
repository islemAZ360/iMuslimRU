import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Container } from '@/components/ui';
import { colors, spacing, typography, shadows, borderRadius } from '@/constants/design';
import { useLanguageStore } from '@/hooks/useLanguage';
import { translations } from '@/constants/translations';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { DateTime } from 'luxon';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blink } from '@/lib/blink';
import { useProfile } from '@/hooks/useProfile';
import Animated, { FadeInUp } from 'react-native-reanimated';

// Simple Hijri date calculator
function getHijriDate(): { day: number; month: string; year: number; monthAr: string; monthRu: string } {
  const HIJRI_MONTHS_EN = ['Muharram','Safar','Rabi Al-Awwal','Rabi Al-Thani','Jumada Al-Awwal','Jumada Al-Thani','Rajab','Sha\'ban','Ramadan','Shawwal','Dhul Qi\'dah','Dhul Hijjah'];
  const HIJRI_MONTHS_AR = ['محرم','صفر','ربيع الأول','ربيع الثاني','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];
  const HIJRI_MONTHS_RU = ['Мухаррам','Сафар','Раби\'ул-Авваль','Раби\'ус-Сани','Джумадал-Уля','Джумадал-Ахира','Раджаб','Шаабан','Рамадан','Шавваль','Зуль-Каада','Зуль-Хиджа'];

  const JD = Math.floor((Date.now() / 86400000) + 2440587.5);
  const l = JD - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const ll = l - 10631 * n + 354;
  const j = Math.floor((10985 - ll) / 5316) * Math.floor((50 * ll) / 17719) + Math.floor(ll / 5670) * Math.floor((43 * ll) / 15238);
  const lll = ll - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * lll) / 709);
  const day = lll - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  return {
    day,
    month: HIJRI_MONTHS_EN[month - 1] || '',
    year,
    monthAr: HIJRI_MONTHS_AR[month - 1] || '',
    monthRu: HIJRI_MONTHS_RU[month - 1] || '',
  };
}

const RAMADAN_DUAS = [
  {
    id: 'iftar',
    titleEn: "Du'a for Iftar",
    titleRu: 'Дуа при ифтаре',
    titleAr: 'دعاء الإفطار',
    arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ',
    transliterationRu: 'Захабаз-замаʾу вабталлатиль-уруку ва сабатал-аджру ин шаа-Ллах.',
    translationRu: 'Ушла жажда, ожили сосуды, и утвердилась награда — ин шаа Аллах.',
    translationEn: 'The thirst is gone, the veins are moistened and the reward is confirmed, if Allah wills.',
  },
  {
    id: 'suhoor_niyyah',
    titleEn: 'Intention for Fasting',
    titleRu: 'Намерение поститься',
    titleAr: 'نية الصيام',
    arabic: 'وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ',
    transliterationRu: 'Ва бисавми гадин навайту мин шахри Рамадан.',
    translationRu: 'Я намерился поститься завтра в месяце Рамадан.',
    translationEn: 'I intend to keep the fast for tomorrow in the month of Ramadan.',
  },
  {
    id: 'laylatul_qadr',
    titleEn: "Du'a for Laylatul Qadr",
    titleRu: 'Дуа в ночь Ляйлятуль-Кадр',
    titleAr: 'دعاء ليلة القدر',
    arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    transliterationRu: "Аллахумма иннака 'афуввун тухиббуль-'афва фа'фу 'анни.",
    translationRu: 'О Аллах, поистине Ты Прощающий, любишь прощение, так прости же меня.',
    translationEn: 'O Allah, indeed You are Pardoning, You love to pardon, so pardon me.',
  },
  {
    id: 'suhoor_dua',
    titleEn: 'Morning Du\'a in Ramadan',
    titleRu: 'Утреннее дуа в Рамадан',
    titleAr: 'دعاء صباح رمضان',
    arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِي رَمَضَانَ وَبَلِّغْنَا لَيْلَةَ الْقَدْرِ',
    transliterationRu: 'Аллахумма барик лана фи Рамадан ва баллигна лайлаталь-кадр.',
    translationRu: 'О Аллах, благослови нас в Рамадане и дай нам достичь Ночи Предопределения.',
    translationEn: 'O Allah, bless us in Ramadan and let us reach Laylatul Qadr.',
  },
];

export default function Ramadan() {
  const { language } = useLanguageStore();
  const t = translations[language].ramadan;
  const { user } = useProfile();
  const queryClient = useQueryClient();

  const [times, setTimes] = useState<{ fajr: string; maghrib: string } | null>(null);
  const [countdown, setCountdown] = useState('');
  const [isFasting, setIsFasting] = useState(false);
  const [isLoadingTimes, setIsLoadingTimes] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hijri = getHijriDate();
  const today = DateTime.now().toFormat('yyyy-MM-dd');

  const { data: fastingLogs, refetch: refetchFasting } = useQuery({
    queryKey: ['fastingDays', user?.id],
    queryFn: async () => {
      const userId = user?.id;
      if (!userId) return [];
      return await blink.db.fastingDays.list({ where: { userId } });
    },
    enabled: !!user?.id,
  });

  const todayFasted = fastingLogs?.find((f: any) => f.date === today);
  const fastingCount = fastingLogs?.filter((f: any) => Number(f.fasted) > 0).length || 0;

  const toggleFasting = useMutation({
    mutationFn: async (fasted: boolean) => {
      const userId = user?.id;
      if (!userId) {
        Alert.alert(
          language === 'ru' ? 'Ошибка' : 'Error',
          language === 'ru' ? 'Подождите загрузки профиля' : 'Please wait for profile to load'
        );
        return;
      }
      if (todayFasted) {
        await blink.db.fastingDays.update((todayFasted as any).id, {
          fasted: fasted ? 1 : 0,
        });
      } else {
        await blink.db.fastingDays.create({
          userId,
          date: today,
          fasted: fasted ? 1 : 0,
          createdAt: new Date().toISOString(),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fastingDays', user?.id] });
      refetchFasting();
    },
    onError: (err) => {
      console.error('Fasting toggle error:', err);
    },
  });

  useEffect(() => {
    (async () => {
      setIsLoadingTimes(true);
      try {
        let lat = 55.7558;
        let lon = 37.6173;
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({});
          lat = pos.coords.latitude;
          lon = pos.coords.longitude;
        }

        const coords = new Coordinates(lat, lon);
        const params = CalculationMethod.MuslimWorldLeague();
        const pt = new PrayerTimes(coords, new Date(), params);

        setTimes({
          fajr: DateTime.fromJSDate(pt.fajr).toFormat('HH:mm'),
          maghrib: DateTime.fromJSDate(pt.maghrib).toFormat('HH:mm'),
        });
      } catch (e) {
        console.error('Prayer times error:', e);
      } finally {
        setIsLoadingTimes(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!times) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const tick = () => {
      const now = DateTime.now();
      const maghrib = DateTime.fromFormat(times.maghrib, 'HH:mm');
      const fajr = DateTime.fromFormat(times.fajr, 'HH:mm');

      const currentlyFasting = now > fajr && now < maghrib;
      setIsFasting(currentlyFasting);
      const target = currentlyFasting ? maghrib : (now > maghrib ? fajr.plus({ days: 1 }) : fajr);

      const diff = target.diff(now, ['hours', 'minutes', 'seconds']);
      const hh = String(Math.floor(diff.hours)).padStart(2, '0');
      const mm = String(Math.floor(diff.minutes)).padStart(2, '0');
      const ss = String(Math.floor(diff.seconds)).padStart(2, '0');
      setCountdown(`${hh}:${mm}:${ss}`);
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [times]);

  const getHijriMonthName = () => {
    if (language === 'ar') return hijri.monthAr;
    if (language === 'ru') return hijri.monthRu;
    return hijri.month;
  };

  const isFastedToday = todayFasted && Number(todayFasted.fasted) > 0;
  const isNotFastedToday = todayFasted && Number(todayFasted.fasted) === 0;

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{t.title}</Text>

        {/* Hijri Date */}
        <Animated.View entering={FadeInUp.delay(50)}>
          <View style={styles.hijriCard}>
            <Ionicons name="calendar-outline" size={18} color={colors.gold} />
            <Text style={styles.hijriText}>
              {hijri.day} {getHijriMonthName()} {hijri.year}
            </Text>
          </View>
        </Animated.View>

        {/* Main Countdown Card */}
        <Animated.View entering={FadeInUp.delay(100)}>
          <LinearGradient
            colors={isFasting ? [colors.emeraldRich, colors.emeraldDeep] : ['#1A0B2E', '#2D1B69']}
            style={styles.mainCard}
          >
            <Ionicons name="moon" size={44} color={colors.gold} />
            <Text style={styles.countdownTitle}>
              {isFasting ? t.untilIftar : t.untilSuhoor}
            </Text>
            {isLoadingTimes ? (
              <ActivityIndicator color={colors.gold} size="large" style={{ marginTop: spacing.md }} />
            ) : (
              <Text style={styles.countdown}>{countdown || '00:00:00'}</Text>
            )}
            <Text style={styles.countdownSubtitle}>
              {isFasting ? `${t.iftar}: ${times?.maghrib || '--:--'}` : `${t.suhoor}: ${times?.fajr || '--:--'}`}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Suhoor / Iftar Times */}
        <Animated.View entering={FadeInUp.delay(150)}>
          <View style={styles.row}>
            <View style={styles.timeCard}>
              <View style={[styles.timeIconBg, { backgroundColor: 'rgba(217,119,6,0.2)' }]}>
                <Ionicons name="sunny-outline" size={22} color="#D97706" />
              </View>
              <Text style={styles.cardLabel}>{t.suhoor}</Text>
              <Text style={styles.time}>{times?.fajr || '--:--'}</Text>
            </View>
            <View style={styles.timeCard}>
              <View style={[styles.timeIconBg, { backgroundColor: 'rgba(201,168,76,0.2)' }]}>
                <Ionicons name="moon-outline" size={22} color={colors.gold} />
              </View>
              <Text style={styles.cardLabel}>{t.iftar}</Text>
              <Text style={styles.time}>{times?.maghrib || '--:--'}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Fasting Tracker */}
        <Animated.View entering={FadeInUp.delay(200)}>
          <View style={styles.fastingCard}>
            <View style={styles.fastingHeader}>
              <Ionicons name="fitness-outline" size={20} color={colors.gold} />
              <Text style={styles.fastingTitle}>{t.fastingTracker}</Text>
              <View style={styles.fastingCountBadge}>
                <Text style={styles.fastingCountText}>{fastingCount} {t.fastingDays}</Text>
              </View>
            </View>

            {!user?.id && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={colors.gold} />
                <Text style={styles.loadingText}>
                  {language === 'ru' ? 'Загрузка...' : 'Loading...'}
                </Text>
              </View>
            )}

            {user?.id && (
              <View style={styles.fastingButtons}>
                <Pressable
                  style={[
                    styles.fastingButton,
                    isFastedToday && styles.fastingButtonActive,
                  ]}
                  onPress={() => toggleFasting.mutate(true)}
                  disabled={toggleFasting.isPending}
                >
                  {toggleFasting.isPending ? (
                    <ActivityIndicator size="small" color={isFastedToday ? colors.backgroundCard : colors.success} />
                  ) : (
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={22}
                      color={isFastedToday ? colors.backgroundCard : colors.success}
                    />
                  )}
                  <Text style={[
                    styles.fastingButtonText,
                    isFastedToday && styles.fastingButtonTextActive,
                  ]}>
                    {t.didFast}
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.fastingButton,
                    styles.fastingButtonNot,
                    isNotFastedToday && styles.fastingButtonNotActive,
                  ]}
                  onPress={() => toggleFasting.mutate(false)}
                  disabled={toggleFasting.isPending}
                >
                  {toggleFasting.isPending ? (
                    <ActivityIndicator size="small" color={isNotFastedToday ? colors.backgroundCard : colors.error} />
                  ) : (
                    <Ionicons
                      name="close-circle-outline"
                      size={22}
                      color={isNotFastedToday ? colors.backgroundCard : colors.error}
                    />
                  )}
                  <Text style={[
                    styles.fastingButtonText,
                    isNotFastedToday && styles.fastingButtonTextActive,
                  ]}>
                    {t.didNotFast}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Duas Section */}
        <Text style={styles.sectionTitle}>{t.duas}</Text>
        {RAMADAN_DUAS.map((dua, index) => (
          <Animated.View key={dua.id} entering={FadeInUp.delay(250 + index * 80)}>
            <View style={styles.duaCard}>
              <Text style={styles.duaTitle}>
                {language === 'ar' ? dua.titleAr : language === 'ru' ? dua.titleRu : dua.titleEn}
              </Text>
              <Text style={styles.duaArabic}>{dua.arabic}</Text>
              {language === 'ru' && dua.transliterationRu && (
                <Text style={styles.duaTransliteration}>{dua.transliterationRu}</Text>
              )}
              <Text style={styles.duaTranslation}>
                {language === 'ru' ? dua.translationRu : dua.translationEn}
              </Text>
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: spacing.xxxxl },
  title: {
    ...typography.h1,
    color: colors.gold,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    fontWeight: '800',
  },
  hijriCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: 'rgba(201,168,76,0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  hijriText: {
    ...typography.captionBold,
    color: colors.gold,
  },
  mainCard: {
    padding: spacing.xxl,
    borderRadius: 32,
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderGold,
    ...shadows.xl,
  },
  countdownTitle: {
    ...typography.captionBold,
    color: 'rgba(201,168,76,0.85)',
    marginTop: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  countdown: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.gold,
    marginTop: spacing.xs,
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  countdownSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  timeCard: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    padding: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.xs,
    ...shadows.md,
  },
  timeIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  time: {
    ...typography.h2,
    color: colors.gold,
    fontWeight: '700',
  },
  fastingCard: {
    backgroundColor: colors.backgroundCard,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: 20,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  fastingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  fastingTitle: {
    ...typography.h4,
    color: colors.text,
    flex: 1,
  },
  fastingCountBadge: {
    backgroundColor: 'rgba(201,168,76,0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  fastingCountText: {
    ...typography.captionBold,
    color: colors.gold,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  loadingText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  fastingButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  fastingButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.success,
    backgroundColor: 'transparent',
  },
  fastingButtonNot: {
    borderColor: colors.error,
  },
  fastingButtonActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  fastingButtonNotActive: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  fastingButtonText: {
    ...typography.captionBold,
    color: colors.text,
  },
  fastingButtonTextActive: {
    color: colors.backgroundCard,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    fontWeight: '700',
  },
  duaCard: {
    backgroundColor: colors.backgroundCard,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: 20,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  duaTitle: {
    ...typography.h4,
    color: colors.gold,
    marginBottom: spacing.md,
    fontWeight: '700',
  },
  duaArabic: {
    fontSize: 22,
    textAlign: 'right',
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 38,
    fontWeight: '600',
  },
  duaTransliteration: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  duaTranslation: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
