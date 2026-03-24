import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { colors, spacing, typography, shadows, borderRadius } from '@/constants/design';
import { useLanguageStore } from '@/hooks/useLanguage';
import { translations } from '@/constants/translations';
import {
  useAISettings,
  AI_PROVIDERS,
  AIProvider,
  AIProviderInfo,
  AIModel,
} from '@/hooks/useAISettings';

// ─── Header ─────────────────────────────────────────────────────────────────

function Header({ onBack, t }: { onBack: () => void; t: Record<string, string> }) {
  return (
    <LinearGradient colors={[colors.primary, '#064E3B']} style={styles.header}>
      <Pressable onPress={onBack} style={styles.backBtn} hitSlop={12}>
        <Ionicons name="chevron-back" size={24} color={colors.white} />
      </Pressable>
      <View style={styles.headerContent}>
        <View style={styles.headerIconBg}>
          <Ionicons name="hardware-chip-outline" size={28} color={colors.white} />
        </View>
        <Text style={styles.headerTitle}>{t.aiSettings}</Text>
        <Text style={styles.headerSubtitle}>{t.aiProvider}</Text>
      </View>
    </LinearGradient>
  );
}

// ─── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ configured, t }: { configured: boolean; t: Record<string, string> }) {
  return (
    <View style={[styles.statusBadge, configured ? styles.statusBadgeOk : styles.statusBadgeWarn]}>
      <Ionicons
        name={configured ? 'checkmark-circle' : 'alert-circle-outline'}
        size={16}
        color={configured ? colors.success : colors.accent}
      />
      <Text style={[styles.statusText, configured ? styles.statusTextOk : styles.statusTextWarn]}>
        {configured ? t.aiConfigured : t.aiNotConfigured}
      </Text>
    </View>
  );
}

// ─── Provider Card ───────────────────────────────────────────────────────────

interface ProviderCardProps {
  provider: AIProviderInfo;
  isExpanded: boolean;
  isActive: boolean;
  activeModel: string;
  onToggle: () => void;
  onSelectModel: (model: AIModel) => void;
  apiKey: string;
  baseUrl: string;
  onApiKeyChange: (v: string) => void;
  onBaseUrlChange: (v: string) => void;
  showKeyVisible: boolean;
  onToggleKeyVisible: () => void;
  t: Record<string, string>;
}

function ProviderCard({
  provider,
  isExpanded,
  isActive,
  activeModel,
  onToggle,
  onSelectModel,
  apiKey,
  baseUrl,
  onApiKeyChange,
  onBaseUrlChange,
  showKeyVisible,
  onToggleKeyVisible,
  t,
}: ProviderCardProps) {
  return (
    <Animated.View layout={Layout.springify()} style={styles.providerCard}>
      {/* Card header / tap target */}
      <Pressable onPress={onToggle} style={styles.providerHeader}>
        {/* Icon */}
        <LinearGradient colors={provider.gradientColors} style={styles.providerIconBg}>
          <Ionicons name={provider.icon as any} size={22} color={colors.white} />
        </LinearGradient>

        {/* Info */}
        <View style={styles.providerInfo}>
          <View style={styles.providerNameRow}>
            <Text style={styles.providerName}>{provider.name}</Text>
            {isActive && (
              <View style={styles.activePill}>
                <Ionicons name="checkmark-circle" size={12} color={colors.white} />
                <Text style={styles.activePillText}>Active</Text>
              </View>
            )}
          </View>
          <Text style={styles.providerDesc} numberOfLines={1}>
            {provider.description}
          </Text>
          {isActive && (
            <Text style={styles.activeModelLabel} numberOfLines={1}>
              {activeModel}
            </Text>
          )}
        </View>

        {/* Chevron */}
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textTertiary}
        />
      </Pressable>

      {/* Expanded content */}
      {isExpanded && (
        <Animated.View entering={FadeInDown.duration(200)} style={styles.expandedContent}>
          {/* Divider */}
          <View style={styles.divider} />

          {/* Model list */}
          <Text style={styles.subLabel}>{t.selectModel}</Text>
          <View style={styles.modelGrid}>
            {provider.models.map((model) => {
              const isSelected = isActive && activeModel === model.id;
              return (
                <Pressable
                  key={model.id}
                  onPress={() => onSelectModel(model)}
                  style={[styles.modelChip, isSelected && styles.modelChipActive]}
                >
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={14} color={colors.white} />
                  )}
                  <View>
                    <Text
                      style={[styles.modelChipName, isSelected && styles.modelChipNameActive]}
                      numberOfLines={1}
                    >
                      {model.name}
                    </Text>
                    {model.description ? (
                      <Text
                        style={[styles.modelChipDesc, isSelected && styles.modelChipDescActive]}
                        numberOfLines={1}
                      >
                        {model.description}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* API Key */}
          {provider.requiresApiKey && (
            <>
              <Text style={[styles.subLabel, { marginTop: spacing.md }]}>{t.apiKey}</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  value={apiKey}
                  onChangeText={onApiKeyChange}
                  placeholder={provider.apiKeyPlaceholder || 'sk-...'}
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry={!showKeyVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable onPress={onToggleKeyVisible} style={styles.eyeBtn} hitSlop={8}>
                  <Ionicons
                    name={showKeyVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>
            </>
          )}

          {/* Base URL */}
          <Text style={[styles.subLabel, { marginTop: spacing.md }]}>{t.baseUrl}</Text>
          <TextInput
            style={[styles.textInput, styles.textInputFull]}
            value={baseUrl}
            onChangeText={onBaseUrlChange}
            placeholder={provider.defaultBaseUrl || 'https://api.example.com/v1'}
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </Animated.View>
      )}
    </Animated.View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function AISettingsScreen() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const t = translations[language].settings as Record<string, string>;

  const {
    provider: activeProvider,
    model: activeModel,
    apiKey: storedApiKey,
    baseUrl: storedBaseUrl,
    saveSettings,
    isConfigured,
  } = useAISettings();

  // Local state so user can tap around before committing
  const [expandedProvider, setExpandedProvider] = useState<AIProvider | null>(
    activeProvider ?? null
  );
  const [localProvider, setLocalProvider] = useState<AIProvider>(activeProvider);
  const [localModel, setLocalModel] = useState(activeModel);
  const [localApiKey, setLocalApiKey] = useState(storedApiKey);
  const [localBaseUrl, setLocalBaseUrl] = useState(storedBaseUrl);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleToggleProvider = useCallback(
    (id: AIProvider) => {
      setExpandedProvider((prev) => (prev === id ? null : id));
    },
    []
  );

  const handleSelectModel = useCallback(
    (provider: AIProvider, model: AIModel) => {
      setLocalProvider(provider);
      setLocalModel(model.id);
    },
    []
  );

  const handleSave = () => {
    saveSettings({
      provider: localProvider,
      model: localModel,
      apiKey: localApiKey,
      baseUrl: localBaseUrl,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const configured = isConfigured();

  return (
    <View style={styles.screen}>
      <Header onBack={() => router.back()} t={t} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status */}
        <Animated.View entering={FadeInUp.delay(50)} style={styles.statusRow}>
          <StatusBadge configured={configured} t={t} />
        </Animated.View>

        {/* Provider list */}
        <Animated.View entering={FadeInUp.delay(100)}>
          <Text style={styles.sectionLabel}>{t.aiProvider}</Text>
        </Animated.View>

        {AI_PROVIDERS.map((providerInfo, idx) => {
          const isExpanded = expandedProvider === providerInfo.id;
          const isActive = localProvider === providerInfo.id;
          return (
            <Animated.View
              key={providerInfo.id}
              entering={FadeInUp.delay(120 + idx * 40)}
            >
              <ProviderCard
                provider={providerInfo}
                isExpanded={isExpanded}
                isActive={isActive}
                activeModel={isActive ? localModel : ''}
                onToggle={() => handleToggleProvider(providerInfo.id)}
                onSelectModel={(model) => handleSelectModel(providerInfo.id, model)}
                apiKey={isActive ? localApiKey : ''}
                baseUrl={isActive ? localBaseUrl : providerInfo.defaultBaseUrl ?? ''}
                onApiKeyChange={(v) => {
                  setLocalProvider(providerInfo.id);
                  setLocalApiKey(v);
                }}
                onBaseUrlChange={(v) => {
                  setLocalProvider(providerInfo.id);
                  setLocalBaseUrl(v);
                }}
                showKeyVisible={showKey}
                onToggleKeyVisible={() => setShowKey((p) => !p)}
                t={t}
              />
            </Animated.View>
          );
        })}

        {/* Save button */}
        <Animated.View entering={FadeInUp.delay(560)} style={styles.saveContainer}>
          <Pressable
            onPress={handleSave}
            style={[styles.saveBtn, saved && styles.saveBtnSuccess]}
          >
            <Ionicons
              name={saved ? 'checkmark-circle' : 'save-outline'}
              size={22}
              color={colors.white}
            />
            <Text style={styles.saveBtnText}>{saved ? t.success ?? 'Saved!' : t.saveApiSettings}</Text>
          </Pressable>
        </Animated.View>

        <View style={{ height: spacing.xxxxl }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },

  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerContent: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.white,
    fontWeight: '800',
  },
  headerSubtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
  },

  // Scroll
  scrollContent: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },

  // Status
  statusRow: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    ...shadows.sm,
  },
  statusBadgeOk: {
    backgroundColor: colors.successTint,
    borderWidth: 1,
    borderColor: colors.success,
  },
  statusBadgeWarn: {
    backgroundColor: colors.accentTint,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  statusText: {
    ...typography.captionBold,
  },
  statusTextOk: { color: colors.successDark },
  statusTextWarn: { color: colors.accentDark },

  // Section label
  sectionLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },

  // Provider card
  providerCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadows.sm,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  providerIconBg: {
    width: 46,
    height: 46,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  providerInfo: {
    flex: 1,
    gap: 2,
  },
  providerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  providerName: {
    ...typography.bodyBold,
    color: colors.text,
  },
  providerDesc: {
    ...typography.small,
    color: colors.textSecondary,
  },
  activeModelLabel: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  activePillText: {
    ...typography.tiny,
    color: colors.white,
    fontWeight: '700',
  },

  // Expanded content
  expandedContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  subLabel: {
    ...typography.smallBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },

  // Model grid
  modelGrid: {
    gap: spacing.sm,
  },
  modelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  modelChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  modelChipName: {
    ...typography.captionBold,
    color: colors.text,
  },
  modelChipNameActive: {
    color: colors.white,
  },
  modelChipDesc: {
    ...typography.tiny,
    color: colors.textTertiary,
  },
  modelChipDescActive: {
    color: 'rgba(255,255,255,0.75)',
  },

  // Inputs
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  textInput: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.text,
  },
  textInputFull: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  eyeBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },

  // Save
  saveContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md + 2,
    ...shadows.md,
  },
  saveBtnSuccess: {
    backgroundColor: colors.success,
  },
  saveBtnText: {
    ...typography.bodyBold,
    color: colors.white,
  },
});
