import { View, Text, StyleSheet, Pressable, ScrollView, Switch, ActivityIndicator, TextInput } from 'react-native';
import { Container, Button, Card, Input } from '@/components/ui';
import { colors, spacing, typography, shadows, borderRadius } from '@/constants/design';
import { useLanguageStore } from '@/hooks/useLanguage';
import { translations, Language } from '@/constants/translations';
import { Ionicons } from '@expo/vector-icons';
import { useProfile, UserProfile } from '@/hooks/useProfile';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

const CALCULATION_METHODS = [
  { id: 'MuslimWorldLeague', name: 'Muslim World League' },
  { id: 'Egyptian', name: 'Egyptian' },
  { id: 'Karachi', name: 'Karachi' },
  { id: 'UmmAlQura', name: 'Umm al-Qura' },
  { id: 'Dubai', name: 'Dubai' },
  { id: 'Qatar', name: 'Qatar' },
  { id: 'Kuwait', name: 'Kuwait' },
  { id: 'MoonsightingCommittee', name: 'Moonsighting Committee' },
  { id: 'Singapore', name: 'Singapore' },
  { id: 'Turkey', name: 'Turkey' },
  { id: 'Tehran', name: 'Tehran' },
];

export default function Settings() {
  const { language, setLanguage } = useLanguageStore();
  const { profile, isLoading, updateProfile } = useProfile();
  const t = translations[language].settings;

  const [localProfile, setLocalProfile] = useState<Partial<UserProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setLocalProfile(profile);
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile.mutateAsync(localProfile);
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
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const city = reverseGeocode[0].city || reverseGeocode[0].region || 'Unknown';
        setLocalProfile(prev => ({ ...prev, city }));
      }
    } catch (error) {
      console.error('Error getting location:', error);
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

  const languages: { code: Language; label: string }[] = [
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
  ];

  return (
    <Container style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t.title}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.language}</Text>
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
                <Text
                  style={[
                    styles.languageButtonText,
                    localProfile.language === lang.code && styles.languageButtonTextActive,
                  ]}
                >
                  {lang.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.city}</Text>
          <View style={styles.cityInputContainer}>
            <Input
              value={localProfile.city || ''}
              onChangeText={(city) => setLocalProfile(prev => ({ ...prev, city }))}
              placeholder="Moscow, Russia"
              containerStyle={{ flex: 1, marginBottom: 0 }}
            />
            <Pressable onPress={getCurrentLocation} disabled={locationLoading} style={styles.gpsButton}>
              {locationLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="location" size={24} color={colors.white} />
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.calculation}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.methodScroll}>
            {CALCULATION_METHODS.map((method) => (
              <Pressable
                key={method.id}
                onPress={() => setLocalProfile(prev => ({ ...prev, calculationMethod: method.id }))}
                style={[
                  styles.methodButton,
                  localProfile.calculationMethod === method.id && styles.methodButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.methodButtonText,
                    localProfile.calculationMethod === method.id && styles.methodButtonTextActive,
                  ]}
                >
                  {method.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.notifications}</Text>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>{t.prayerAlerts}</Text>
            </View>
            <Switch
              value={localProfile.prayerAlerts === 1}
              onValueChange={(val) => setLocalProfile(prev => ({ ...prev, prayerAlerts: val ? 1 : 0 }))}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={localProfile.prayerAlerts === 1 ? colors.primary : colors.white}
            />
          </View>
          <View style={styles.settingRow}>
            <View>
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

        <Button
          variant="primary"
          onPress={handleSave}
          loading={isSaving}
          style={styles.saveButton}
        >
          {t.save}
        </Button>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxxl,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
  languageContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  languageButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  languageButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  languageButtonText: {
    ...typography.body,
    color: colors.text,
  },
  languageButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  itemText: {
    ...typography.body,
    color: colors.text,
  },
  methodScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  methodButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    backgroundColor: colors.background,
  },
  methodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  methodButtonText: {
    ...typography.caption,
    color: colors.text,
  },
  methodButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settingLabel: {
    ...typography.body,
    color: colors.text,
  },
  saveButton: {
    marginTop: spacing.xl,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  cityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  gpsButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
});
