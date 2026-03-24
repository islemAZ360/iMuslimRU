import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Switch, ActivityIndicator, Linking } from 'react-native';
import { Container, Button, Input } from '@/components/ui';
import { colors, spacing, typography, shadows, borderRadius } from '@/constants/design';
import { useLanguageStore } from '@/hooks/useLanguage';
import { translations, Language } from '@/constants/translations';
import { Ionicons } from '@expo/vector-icons';
import { useProfile, UserProfile } from '@/hooks/useProfile';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';

const CALCULATION_METHODS = [
  { id: 'MuslimWorldLeague', name: 'Muslim World League', nameRu: 'Мировая Лига' },
  { id: 'Egyptian', name: 'Egyptian', nameRu: 'Египетский' },
  { id: 'Karachi', name: 'Karachi', nameRu: 'Карачи' },
  { id: 'UmmAlQura', name: 'Umm al-Qura', nameRu: 'Умм аль-Кура' },
  { id: 'Dubai', name: 'Dubai', nameRu: 'Дубай' },
  { id: 'Qatar', name: 'Qatar', nameRu: 'Катар' },
  { id: 'Kuwait', name: 'Kuwait', nameRu: 'Кувейт' },
  { id: 'Turkey', name: 'Turkey', nameRu: 'Турция' },
  { id: 'Tehran', name: 'Tehran', nameRu: 'Тегеран' },
];

const APP_VERSION = '1.0.0';

export default function Settings() {
  const { language, setLanguage } = useLanguageStore();
  const { profile, isLoading, updateProfile } = useProfile();
  const t = translations[language].settings;
  const router = useRouter();

  const [localProfile, setLocalProfile] = useState<Partial<UserProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (profile) setLocalProfile(profile);
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfile.mutateAsync(localProfile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let location = await Location.getCurrentPositionAsync({});
      const geo = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (geo.length > 0) {
        const city = geo[0].city || geo[0].region || 'Unknown';
        setLocalProfile(prev => ({ ...prev, city }));
      }
    } finally {
      setLocationLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Container style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Container>
    );
  }

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  ];

  return (
    <Container style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(0)}>
          <LinearGradient colors={[colors.primary, '#1565C0']} style={styles.headerCard}>
            <View style={styles.headerIconBg}>
              <Ionicons name="settings" size={32} color={colors.white} />
            </View>
            <Text style={styles.headerTitle}>{t.title}</Text>
            <Text style={styles.headerSubtitle}>{t.appName}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Language */}
        <Animated.View entering={FadeInUp.delay(80)}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t.language}</Text>
            <View style={styles.languageContainer}>
              {languages.map((lang) => (
                <Pressable
                  key={lang.code}
                  onPress={() => setLocalProfile(prev => ({ ...prev, language: lang.code }))}
                  style={[
                    styles.languageButton,
                    localProfile.language === lang.code && styles.languageButtonActive,
                  ]}
                >
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <Text style={[
                    styles.languageButtonText,
                    localProfile.language === lang.code && styles.languageButtonTextActive,
                  ]}>
                    {lang.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* City */}
        <Animated.View entering={FadeInUp.delay(120)}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t.city}</Text>
            <View style={styles.cityInputContainer}>
              <Input
                value={localProfile.city || ''}
                onChangeText={(city) => setLocalProfile(prev => ({ ...prev, city }))}
                placeholder="Moscow, Russia"
                containerStyle={{ flex: 1, marginBottom: 0 }}
              />
              <Pressable onPress={getCurrentLocation} disabled={locationLoading} style={styles.gpsButton}>
                {locationLoading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Ionicons name="locate" size={22} color={colors.white} />
                )}
              </Pressable>
            </View>
          </View>
        </Animated.View>

        {/* Calculation Method */}
        <Animated.View entering={FadeInUp.delay(160)}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t.calculation}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.methodRow}>
                {CALCULATION_METHODS.map((method) => (
                  <Pressable
                    key={method.id}
                    onPress={() => setLocalProfile(prev => ({ ...prev, calculationMethod: method.id }))}
                    style={[
                      styles.methodButton,
                      localProfile.calculationMethod === method.id && styles.methodButtonActive,
                    ]}
                  >
                    <Text style={[
                      styles.methodButtonText,
                      localProfile.calculationMethod === method.id && styles.methodButtonTextActive,
                    ]}>
                      {language === 'ru' ? method.nameRu : method.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </Animated.View>

        {/* Notifications */}
        <Animated.View entering={FadeInUp.delay(200)}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t.notifications}</Text>
            <View style={styles.card}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="notifications-outline" size={20} color={colors.primary} />
                  <Text style={styles.settingLabel}>{t.prayerAlerts}</Text>
                </View>
                <Switch
                  value={localProfile.prayerAlerts === 1}
                  onValueChange={(val) => setLocalProfile(prev => ({ ...prev, prayerAlerts: val ? 1 : 0 }))}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={localProfile.prayerAlerts === 1 ? colors.primary : colors.white}
                />
              </View>
              <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
                <View style={styles.settingInfo}>
                  <Ionicons name="book-outline" size={20} color={colors.primary} />
                  <Text style={styles.settingLabel}>{t.adhkarReminders}</Text>
                </View>
                <Switch
                  value={localProfile.adhkarReminders === 1}
                  onValueChange={(val) => setLocalProfile(prev => ({ ...prev, adhkarReminders: val ? 1 : 0 }))}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={localProfile.adhkarReminders === 1 ? colors.primary : colors.white}
                />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Quick Links */}
        <Animated.View entering={FadeInUp.delay(240)}>
          <View style={styles.section}>
            <View style={styles.card}>
              <Pressable style={styles.linkRow} onPress={() => router.push('/qibla')}>
                <Ionicons name="compass-outline" size={20} color={colors.primary} />
                <Text style={styles.linkText}>{translations[language].qibla.title}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </Pressable>
              <Pressable style={[styles.linkRow, { borderBottomWidth: 0 }]} onPress={() => router.push('/(tabs)/adhkar')}>
                <Ionicons name="book-outline" size={20} color={colors.primary} />
                <Text style={styles.linkText}>{translations[language].adhkar.title}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </Pressable>
            </View>
          </View>
        </Animated.View>

        {/* Save Button */}
        <Animated.View entering={FadeInUp.delay(280)}>
          <Pressable
            style={[styles.saveButton, saveSuccess && styles.saveButtonSuccess]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <>
                <Ionicons
                  name={saveSuccess ? 'checkmark-circle' : 'save-outline'}
                  size={22}
                  color={colors.white}
                />
                <Text style={styles.saveButtonText}>
                  {isSaving ? t.saving : saveSuccess ? t.success : t.save}
                </Text>
              </>
            )}
          </Pressable>
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInUp.delay(320)}>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>{t.about}</Text>
            <Text style={styles.aboutAppName}>{t.appName}</Text>
            <Text style={styles.aboutVersion}>{t.version} {APP_VERSION}</Text>
            <Text style={styles.aboutDev}>{t.developer}</Text>
          </View>
        </Animated.View>

        <View style={{ height: spacing.xxxxl }} />
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { paddingBottom: spacing.xxxxl },
  headerCard: {
    alignItems: 'center',
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    marginBottom: spacing.lg,
  },
  headerIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.white,
    fontWeight: '800',
  },
  headerSubtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
    overflow: 'hidden',
  },
  languageContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  languageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  languageButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  languageFlag: { fontSize: 18 },
  languageButtonText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  languageButtonTextActive: {
    color: colors.white,
  },
  cityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  gpsButton: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  methodRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  methodButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  methodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  methodButtonText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '500',
  },
  methodButtonTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settingLabel: {
    ...typography.body,
    color: colors.text,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  linkText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  saveButton: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
    ...shadows.md,
  },
  saveButtonSuccess: {
    backgroundColor: colors.success,
  },
  saveButtonText: {
    ...typography.bodyBold,
    color: colors.white,
  },
  aboutCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    gap: spacing.xs,
    ...shadows.sm,
  },
  aboutTitle: {
    ...typography.captionBold,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  aboutAppName: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '800',
  },
  aboutVersion: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  aboutDev: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
