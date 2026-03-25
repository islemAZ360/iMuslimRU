import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { colors, spacing, typography, shadows, borderRadius } from '@/constants/design';
import { useLanguageStore } from '@/hooks/useLanguage';
import { translations } from '@/constants/translations';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useProfile } from '@/hooks/useProfile';
import { useAISettings, getProviderInfo } from '@/hooks/useAISettings';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { DateTime } from 'luxon';
import { useRouter } from 'expo-router';
import { blink } from '@/lib/blink';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ScanResult {
  productName: string;
  status: 'Halal' | 'Haram' | 'Doubtful';
  ingredients: string[];
  reason: string;
  confidence: number;
  halalIngredients?: string[];
  haramIngredients?: string[];
  doubtfulIngredients?: string[];
}

// Default Blink AI model — works without any user API key
const DEFAULT_MODEL = 'google/gemini-2.0-flash';

export default function Scanner() {
  const { language } = useLanguageStore();
  const t = translations[language].scanner;
  const { user } = useProfile();
  const queryClient = useQueryClient();
  const router = useRouter();
  const aiSettings = useAISettings();

  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: scanHistory } = useQuery({
    queryKey: ['scanHistory', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await blink.db.halalScans.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        limit: 20,
      });
    },
    enabled: !!user,
  });

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert('Permission Error', t.cameraPermission);
        return false;
      }
    }
    return true;
  };

  const handleTakePhoto = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('', 'Camera not available on web. Please select an image from gallery.');
      return;
    }
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;
    const pickerResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!pickerResult.canceled) processImage(pickerResult.assets[0].uri);
  };

  const handlePickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!pickerResult.canceled) processImage(pickerResult.assets[0].uri);
  };

  const processImage = async (uri: string) => {
    setImage(uri);
    setResult(null);
    setErrorMsg(null);
    setLoading(true);

    try {
      // Upload image to get a public HTTPS URL
      const filename = uri.split('/').pop() || `scan_${Date.now()}.jpg`;
      const ext = filename.split('.').pop() || 'jpg';
      const response = await fetch(uri);
      const blob = await response.blob();

      const { publicUrl } = await blink.storage.upload(
        blob as unknown as File,
        `scans/${Date.now()}.${ext}`
      );

      const languageName = language === 'ru' ? 'Russian' : language === 'ar' ? 'Arabic' : 'English';

      // Choose model: use configured provider if set, else fallback to Blink's default Gemini
      let modelToUse = DEFAULT_MODEL;
      if (aiSettings.isConfigured()) {
        const providerModelMap: Record<string, string> = {
          openai: `openai/${aiSettings.model}`,
          anthropic: `anthropic/${aiSettings.model}`,
          google: `google/${aiSettings.model}`,
          mistral: `mistral/${aiSettings.model}`,
          groq: `groq/${aiSettings.model}`,
          cohere: `cohere/${aiSettings.model}`,
          xai: `xai/${aiSettings.model}`,
          deepseek: `deepseek/${aiSettings.model}`,
          meta: `meta/${aiSettings.model}`,
          ollama: `ollama/${aiSettings.model}`,
        };
        modelToUse = providerModelMap[aiSettings.provider] || DEFAULT_MODEL;
      }

      const { object } = await blink.ai.generateObject({
        model: modelToUse,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are an expert Islamic Halal Food Analyst. Analyze this product image.

Examine the ingredients label carefully. Determine if the product is:
- Halal: All ingredients are permissible in Islam
- Haram: Contains clearly forbidden ingredients (pork, alcohol, non-halal meat, etc.)
- Doubtful: Contains ambiguous ingredients (certain E-numbers, unclear animal derivatives)

Consider: E-numbers, gelatin sources, alcohol in flavorings, meat sources, emulsifiers, carmine (E120), L-cysteine (E920), rennet.

Provide the productName and reason in ${languageName}.
Categorize ingredients into halal, haram, and doubtful lists.
If no ingredients label is visible, analyze the product packaging and name.`,
              },
              {
                type: 'image',
                image: publicUrl,
              },
            ],
          },
        ],
        schema: {
          type: 'object',
          properties: {
            productName: { type: 'string' },
            status: { type: 'string', enum: ['Halal', 'Haram', 'Doubtful'] },
            ingredients: { type: 'array', items: { type: 'string' } },
            halalIngredients: { type: 'array', items: { type: 'string' } },
            haramIngredients: { type: 'array', items: { type: 'string' } },
            doubtfulIngredients: { type: 'array', items: { type: 'string' } },
            reason: { type: 'string' },
            confidence: { type: 'number' },
          },
          required: ['productName', 'status', 'ingredients', 'reason', 'confidence'],
        },
      });

      const scanData = object as ScanResult;
      setResult(scanData);

      // Save to DB
      const userId = user?.id || 'guest_user';
      await blink.db.halalScans.create({
        userId,
        imageUrl: publicUrl,
        productName: scanData.productName,
        result: scanData.status,
        reason: scanData.reason,
        ingredients: JSON.stringify(scanData.ingredients),
        confidence: scanData.confidence,
        createdAt: new Date().toISOString(),
      });

      queryClient.invalidateQueries({ queryKey: ['scanHistory', user?.id] });
    } catch (error: any) {
      console.error('Scan error:', error);
      const msg = error?.message || t.scanError;
      setErrorMsg(msg);
      Alert.alert(
        language === 'ru' ? 'Ошибка анализа' : 'Scan Error',
        language === 'ru'
          ? 'Не удалось проанализировать изображение. Проверьте подключение к интернету.'
          : 'Failed to analyze image. Check your internet connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Halal': return colors.success;
      case 'Haram': return colors.error;
      default: return colors.warning;
    }
  };

  const getStatusGradient = (status: string): [string, string] => {
    switch (status) {
      case 'Halal': return ['#064E3B', '#10B981'];
      case 'Haram': return ['#7F1D1D', '#EF4444'];
      default: return ['#78350F', '#F59E0B'];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Halal': return 'checkmark-circle';
      case 'Haram': return 'close-circle';
      default: return 'warning';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Halal': return t.resultHalal;
      case 'Haram': return t.resultHaram;
      default: return t.resultMushbooh;
    }
  };

  const providerInfo = getProviderInfo(aiSettings.provider);
  const isAIConfigured = aiSettings.isConfigured();
  const modelLabel = isAIConfigured
    ? `${providerInfo?.name || aiSettings.provider} · ${aiSettings.model}`
    : 'Gemini AI (Default)';

  if (showHistory) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#022C22', '#065F46']} style={styles.historyHeaderGrad}>
          <Pressable onPress={() => setShowHistory(false)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>
          <Text style={styles.historyHeaderTitle}>{t.historyTitle}</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.historyList} showsVerticalScrollIndicator={false}>
          {scanHistory && scanHistory.length > 0 ? (
            scanHistory.map((scan: any, i: number) => (
              <Animated.View key={scan.id} entering={FadeInUp.delay(i * 60)}>
                <View style={styles.historyItem}>
                  <LinearGradient
                    colors={getStatusGradient(scan.result)}
                    style={styles.historyStatusIndicator}
                  >
                    <Ionicons name={getStatusIcon(scan.result) as any} size={18} color={colors.white} />
                  </LinearGradient>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyProductName} numberOfLines={1}>
                      {scan.productName || '—'}
                    </Text>
                    <Text style={styles.historyDate}>
                      {DateTime.fromISO(scan.createdAt).toFormat('dd/MM/yyyy HH:mm')}
                    </Text>
                  </View>
                  <View style={[styles.historyBadge, { backgroundColor: getStatusColor(scan.result) + '22' }]}>
                    <Text style={[styles.historyBadgeText, { color: getStatusColor(scan.result) }]}>
                      {getStatusText(scan.result)}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="scan-outline" size={40} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>{t.noHistory}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Premium header */}
        <LinearGradient colors={['#022C22', '#064E3B', '#0D2137']} style={styles.headerGrad}>
          {/* Geometric dots */}
          {Array.from({ length: 12 }).map((_, i) => (
            <View key={i} style={[styles.geoDot, {
              left: (i % 4) * 100 - 20,
              top: Math.floor(i / 4) * 50 - 10,
              opacity: 0.05 + (i % 3) * 0.02,
            }]} />
          ))}
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>{t.title}</Text>
              <Text style={styles.headerSubtitle}>{modelLabel}</Text>
            </View>
            <Pressable onPress={() => setShowHistory(true)} style={styles.historyBtn}>
              <Ionicons name="time" size={20} color="#C9A84C" />
            </Pressable>
          </View>

          {/* AI Status row */}
          <Pressable onPress={() => router.push('/ai-settings')} style={styles.aiStatusBanner}>
            <Ionicons
              name={isAIConfigured ? 'checkmark-circle' : 'hardware-chip-outline'}
              size={16}
              color={isAIConfigured ? '#86EFAC' : '#C9A84C'}
            />
            <Text style={[styles.aiBannerText, isAIConfigured && styles.aiBannerTextOk]}>
              {isAIConfigured
                ? `${providerInfo?.name} · ${aiSettings.model}`
                : language === 'ru'
                  ? 'Gemini AI · Нажмите для настройки'
                  : language === 'ar'
                  ? 'Gemini AI · انقر للإعداد'
                  : 'Gemini AI · Tap to configure'}
            </Text>
            <Ionicons name="chevron-forward" size={14} color={isAIConfigured ? '#86EFAC' : '#C9A84C'} />
          </Pressable>
        </LinearGradient>

        {/* Image Preview */}
        <View style={styles.previewSection}>
          <Animated.View entering={FadeIn}>
            <View style={styles.previewContainer}>
              {image ? (
                <Image source={{ uri: image }} style={styles.imagePreview} resizeMode="cover" />
              ) : (
                <LinearGradient
                  colors={['#0A2818', '#111827']}
                  style={styles.placeholderGradient}
                >
                  <View style={styles.placeholderIconBg}>
                    <Ionicons name="scan" size={48} color={colors.primary} />
                  </View>
                  <Text style={styles.placeholderTitle}>{t.ready}</Text>
                  <Text style={styles.placeholderSubtitle}>
                    {language === 'ru'
                      ? 'Сфотографируйте этикетку продукта'
                      : language === 'ar'
                      ? 'التقط صورة لملصق المنتج'
                      : 'Take a photo of the product label'}
                  </Text>
                </LinearGradient>
              )}

              {loading && (
                <View style={styles.loadingOverlay}>
                  <View style={styles.loadingCard}>
                    <View style={styles.loadingIconBg}>
                      <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                    <Text style={styles.loadingTitle}>{t.scanning}</Text>
                    <Text style={styles.loadingSubtitle}>{modelLabel}</Text>
                  </View>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Error message */}
          {errorMsg && !loading && (
            <Animated.View entering={FadeInUp} style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
              <Text style={styles.errorText} numberOfLines={2}>{errorMsg}</Text>
            </Animated.View>
          )}

          {/* Action Buttons */}
          {!loading && !result && (
            <Animated.View entering={FadeInUp.delay(100)} style={styles.actionButtons}>
              <Pressable style={styles.primaryActionBtn} onPress={handleTakePhoto}>
                <LinearGradient colors={['#022C22', '#065F46']} style={styles.actionBtnGradient}>
                  <Ionicons name="camera" size={24} color="#C9A84C" />
                  <Text style={styles.actionBtnText}>{t.takePhoto}</Text>
                </LinearGradient>
              </Pressable>
              <Pressable style={styles.secondaryActionBtn} onPress={handlePickImage}>
                <Ionicons name="images-outline" size={22} color={colors.primary} />
                <Text style={styles.secondaryBtnText}>{t.selectImage}</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* Scan Again */}
          {result && !loading && (
            <Pressable
              style={styles.scanAgainBtn}
              onPress={() => { setResult(null); setImage(null); setErrorMsg(null); }}
            >
              <Ionicons name="scan-outline" size={20} color={colors.primary} />
              <Text style={styles.scanAgainText}>{t.scanButton}</Text>
            </Pressable>
          )}
        </View>

        {/* Result Card */}
        {result && (
          <Animated.View entering={FadeInUp} style={styles.resultSection}>
            {/* Status Banner */}
            <LinearGradient colors={getStatusGradient(result.status)} style={styles.statusBanner}>
              <Ionicons name={getStatusIcon(result.status) as any} size={36} color={colors.white} />
              <View>
                <Text style={styles.statusText}>{getStatusText(result.status)}</Text>
                <Text style={styles.statusProductName} numberOfLines={1}>{result.productName}</Text>
              </View>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceValue}>{Math.round(result.confidence * 100)}%</Text>
                <Text style={styles.confidenceLabel}>{t.confidence}</Text>
              </View>
            </LinearGradient>

            {/* Detailed breakdown */}
            <View style={styles.resultDetails}>
              {/* Reason */}
              <View style={styles.detailSection}>
                <View style={styles.detailHeader}>
                  <View style={[styles.detailIconBg, { backgroundColor: colors.primaryTint }]}>
                    <Ionicons name="information-circle" size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.detailTitle}>{t.reason}</Text>
                </View>
                <Text style={styles.reasonText}>{result.reason}</Text>
              </View>

              {/* Haram Ingredients */}
              {result.haramIngredients && result.haramIngredients.length > 0 && (
                <View style={styles.detailSection}>
                  <View style={styles.detailHeader}>
                    <View style={[styles.detailIconBg, { backgroundColor: colors.errorTint }]}>
                      <Ionicons name="close-circle" size={18} color={colors.error} />
                    </View>
                    <Text style={[styles.detailTitle, { color: colors.error }]}>
                      {language === 'ru' ? 'Харамные ингредиенты' : language === 'ar' ? 'مكونات محرمة' : 'Haram Ingredients'}
                    </Text>
                  </View>
                  <View style={styles.ingredientsList}>
                    {result.haramIngredients.map((item, index) => (
                      <View key={index} style={[styles.ingredientTag, { backgroundColor: colors.errorTint, borderColor: colors.error + '44' }]}>
                        <Text style={[styles.ingredientText, { color: colors.errorLight }]}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Doubtful Ingredients */}
              {result.doubtfulIngredients && result.doubtfulIngredients.length > 0 && (
                <View style={styles.detailSection}>
                  <View style={styles.detailHeader}>
                    <View style={[styles.detailIconBg, { backgroundColor: colors.warningTint }]}>
                      <Ionicons name="warning" size={18} color={colors.warning} />
                    </View>
                    <Text style={[styles.detailTitle, { color: colors.warningLight }]}>
                      {language === 'ru' ? 'Сомнительные ингредиенты' : language === 'ar' ? 'مكونات مشكوك بها' : 'Doubtful Ingredients'}
                    </Text>
                  </View>
                  <View style={styles.ingredientsList}>
                    {result.doubtfulIngredients.map((item, index) => (
                      <View key={index} style={[styles.ingredientTag, { backgroundColor: colors.warningTint, borderColor: colors.warning + '44' }]}>
                        <Text style={[styles.ingredientText, { color: colors.warningLight }]}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* All Ingredients */}
              {result.ingredients.length > 0 && (
                <View style={styles.detailSection}>
                  <View style={styles.detailHeader}>
                    <View style={[styles.detailIconBg, { backgroundColor: colors.primaryTint }]}>
                      <Ionicons name="list" size={18} color={colors.primary} />
                    </View>
                    <Text style={styles.detailTitle}>{t.ingredients}</Text>
                  </View>
                  <View style={styles.ingredientsList}>
                    {result.ingredients.map((item, index) => (
                      <View key={index} style={styles.ingredientTag}>
                        <Text style={styles.ingredientText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: {},

  // Header
  headerGrad: {
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  geoDot: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.4)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(201, 168, 76, 0.8)',
    marginTop: 4,
    fontWeight: '500',
    maxWidth: SCREEN_WIDTH * 0.65,
  },
  historyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(201, 168, 76, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.3)',
  },
  aiStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(201, 168, 76, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.25)',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  aiBannerText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(201, 168, 76, 0.9)',
    fontWeight: '500',
  },
  aiBannerTextOk: {
    color: '#86EFAC',
  },

  // Preview
  previewSection: {
    padding: spacing.lg,
  },
  previewContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 24,
    overflow: 'hidden',
    ...shadows.lg,
    marginBottom: spacing.lg,
  },
  imagePreview: { width: '100%', height: '100%' },
  placeholderGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.backgroundCard,
  },
  placeholderIconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(6, 95, 70, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  placeholderTitle: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'center',
  },
  placeholderSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 10, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTitle: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: '700',
  },
  loadingSubtitle: {
    ...typography.small,
    color: colors.textSecondary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.errorTint,
    borderWidth: 1,
    borderColor: colors.error + '44',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.small,
    color: colors.errorLight,
    flex: 1,
  },
  actionButtons: { gap: spacing.md },
  primaryActionBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.md,
  },
  actionBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
    gap: spacing.sm,
  },
  actionBtnText: {
    ...typography.bodyBold,
    color: '#C9A84C',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.backgroundElevated,
  },
  secondaryBtnText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  scanAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.backgroundElevated,
    ...shadows.sm,
  },
  scanAgainText: {
    ...typography.bodyBold,
    color: colors.primary,
  },

  // Result
  resultSection: {
    marginHorizontal: spacing.lg,
    borderRadius: 24,
    overflow: 'hidden',
    ...shadows.lg,
    marginBottom: spacing.lg,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  statusText: {
    ...typography.h2,
    color: colors.white,
    fontWeight: '800',
  },
  statusProductName: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
    maxWidth: SCREEN_WIDTH * 0.4,
  },
  confidenceBadge: {
    marginLeft: 'auto' as any,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  confidenceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
  },
  confidenceLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  resultDetails: {
    backgroundColor: colors.backgroundCard,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  detailSection: {
    gap: spacing.sm,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailTitle: {
    ...typography.captionBold,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reasonText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  ingredientTag: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  ingredientText: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // History
  historyHeaderGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyHeaderTitle: {
    flex: 1,
    ...typography.h3,
    color: colors.white,
    fontWeight: '700',
    textAlign: 'center',
  },
  historyList: {
    padding: spacing.lg,
    gap: spacing.sm,
    paddingBottom: 100,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyStatusIndicator: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyContent: {
    flex: 1,
  },
  historyProductName: {
    ...typography.bodyBold,
    color: colors.text,
  },
  historyDate: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  historyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  historyBadgeText: {
    ...typography.smallBold,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: spacing.lg,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(6,95,70,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(6,95,70,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textSecondary,
  },
});
