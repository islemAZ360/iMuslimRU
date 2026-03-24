import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { Container, Button, Card } from '@/components/ui';
import { colors, spacing, typography, shadows, borderRadius } from '@/constants/design';
import { useLanguageStore } from '@/hooks/useLanguage';
import { translations } from '@/constants/translations';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useProfile } from '@/hooks/useProfile';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { DateTime } from 'luxon';

interface ScanResult {
  productName: string;
  status: 'Halal' | 'Haram' | 'Doubtful';
  ingredients: string[];
  reason: string;
  confidence: number;
}

export default function Scanner() {
  const { language } = useLanguageStore();
  const t = translations[language].scanner;
  const { user } = useProfile();
  const queryClient = useQueryClient();

  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const { data: scanHistory } = useQuery({
    queryKey: ['scanHistory', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('halal_scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
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
    setLoading(true);

    try {
      const filename = uri.split('/').pop() || `scan_${Date.now()}.jpg`;
      const ext = filename.split('.').pop() || 'jpg';
      const response = await fetch(uri);
      const blob = await response.blob();

      const { publicUrl } = await blink.storage.upload(
        blob as unknown as File,
        `scans/${Date.now()}.${ext}`
      );

      const languageName = language === 'ru' ? 'Russian' : language === 'ar' ? 'Arabic' : 'English';

      const { object } = await blink.ai.generateObject({
        model: 'google/gemini-3-flash',
        prompt: `You are an expert Islamic Halal Food Analyst. Analyze this product image: ${publicUrl}
        
        Examine the ingredients label carefully. Determine if the product is:
        - Halal: All ingredients are permissible in Islam
        - Haram: Contains clearly forbidden ingredients (pork, alcohol, non-halal meat, etc.)
        - Doubtful: Contains ambiguous ingredients (certain E-numbers, unclear animal derivatives)
        
        Consider: E-numbers, gelatin sources, alcohol in flavorings, meat sources, emulsifiers.
        Provide the productName and reason in ${languageName}.
        
        Return JSON only:`,
        schema: {
          type: 'object',
          properties: {
            productName: { type: 'string' },
            status: { type: 'string', enum: ['Halal', 'Haram', 'Doubtful'] },
            ingredients: { type: 'array', items: { type: 'string' } },
            reason: { type: 'string' },
            confidence: { type: 'number' },
          },
          required: ['productName', 'status', 'ingredients', 'reason', 'confidence'],
        },
      });

      const scanData = object as ScanResult;
      setResult(scanData);

      const userId = user?.id || 'guest_user';
      await supabase.from('halal_scans').insert({
        user_id: userId,
        image_url: publicUrl,
        product_name: scanData.productName,
        result: scanData.status,
        reason: scanData.reason,
        ingredients: JSON.stringify(scanData.ingredients),
        confidence: scanData.confidence,
      });

      queryClient.invalidateQueries({ queryKey: ['scanHistory', user?.id] });
    } catch (error) {
      console.error('Scan error:', error);
      Alert.alert('Error', t.scanError);
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
      case 'Halal': return ['#059669', '#10B981'];
      case 'Haram': return ['#DC2626', '#EF4444'];
      default: return ['#D97706', '#F59E0B'];
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

  if (showHistory) {
    return (
      <Container style={styles.container}>
        <View style={styles.historyHeader}>
          <Pressable onPress={() => setShowHistory(false)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.historyTitle}>{t.historyTitle}</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={styles.historyList} showsVerticalScrollIndicator={false}>
          {scanHistory && scanHistory.length > 0 ? (
            scanHistory.map((scan: any, i: number) => (
              <Animated.View key={scan.id} entering={FadeInUp.delay(i * 60)}>
                <View style={styles.historyItem}>
                  <View style={[styles.historyStatusDot, { backgroundColor: getStatusColor(scan.result) }]} />
                  <View style={styles.historyContent}>
                    <Text style={styles.historyProductName} numberOfLines={1}>{scan.productName || '—'}</Text>
                    <Text style={styles.historyDate}>
                      {DateTime.fromISO(scan.createdAt).toFormat('dd/MM/yyyy HH:mm')}
                    </Text>
                  </View>
                  <View style={[styles.historyBadge, { backgroundColor: getStatusColor(scan.result) + '20' }]}>
                    <Text style={[styles.historyBadgeText, { color: getStatusColor(scan.result) }]}>
                      {getStatusText(scan.result)}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="scan-outline" size={64} color={colors.border} />
              <Text style={styles.emptyText}>{t.noHistory}</Text>
            </View>
          )}
        </ScrollView>
      </Container>
    );
  }

  return (
    <Container style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t.title}</Text>
          <Pressable onPress={() => setShowHistory(true)} style={styles.historyBtn}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={styles.historyBtnText}>{t.history}</Text>
          </Pressable>
        </View>

        {/* Image Preview */}
        <Animated.View entering={FadeIn}>
          <View style={styles.previewContainer}>
            {image ? (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            ) : (
              <View style={styles.placeholder}>
                <LinearGradient
                  colors={[colors.primaryTint, colors.backgroundSecondary]}
                  style={styles.placeholderGradient}
                >
                  <Ionicons name="scan-outline" size={72} color={colors.primary} />
                  <Text style={styles.placeholderText}>{t.ready}</Text>
                </LinearGradient>
              </View>
            )}

            {loading && (
              <View style={styles.loadingOverlay}>
                <View style={styles.loadingCard}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>{t.scanning}</Text>
                </View>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Action Buttons */}
        {!loading && !result && (
          <Animated.View entering={FadeInUp.delay(100)} style={styles.actionButtons}>
            <Pressable style={styles.primaryActionBtn} onPress={handleTakePhoto}>
              <LinearGradient colors={[colors.primary, '#1565C0']} style={styles.actionBtnGradient}>
                <Ionicons name="camera" size={26} color={colors.white} />
                <Text style={styles.actionBtnText}>{t.takePhoto}</Text>
              </LinearGradient>
            </Pressable>
            <Pressable style={styles.secondaryActionBtn} onPress={handlePickImage}>
              <Ionicons name="images-outline" size={22} color={colors.primary} />
              <Text style={styles.secondaryBtnText}>{t.selectImage}</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Result Card */}
        {result && (
          <Animated.View entering={FadeInUp}>
            <Card variant="elevated" style={styles.resultCard}>
              <LinearGradient colors={getStatusGradient(result.status)} style={styles.statusBanner}>
                <Ionicons name={getStatusIcon(result.status) as any} size={32} color={colors.white} />
                <Text style={styles.statusText}>{getStatusText(result.status)}</Text>
              </LinearGradient>

              <View style={styles.resultContent}>
                <Text style={styles.productName}>{result.productName}</Text>

                {/* Confidence bar */}
                <View style={styles.confidenceRow}>
                  <Text style={styles.confidenceLabel}>{t.confidence}</Text>
                  <View style={styles.confidenceBarBg}>
                    <View style={[
                      styles.confidenceBarFill,
                      { width: `${result.confidence * 100}%` as any, backgroundColor: getStatusColor(result.status) }
                    ]} />
                  </View>
                  <Text style={[styles.confidenceValue, { color: getStatusColor(result.status) }]}>
                    {Math.round(result.confidence * 100)}%
                  </Text>
                </View>

                {/* Reason */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
                    <Text style={styles.sectionTitle}>{t.reason}</Text>
                  </View>
                  <Text style={styles.reasonText}>{result.reason}</Text>
                </View>

                {/* Ingredients */}
                {result.ingredients.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="list-outline" size={18} color={colors.primary} />
                      <Text style={styles.sectionTitle}>{t.ingredients}</Text>
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

              <Pressable
                style={styles.resetButton}
                onPress={() => { setResult(null); setImage(null); }}
              >
                <Ionicons name="scan-outline" size={20} color={colors.primary} />
                <Text style={styles.resetButtonText}>{t.scanButton}</Text>
              </Pressable>
            </Card>
          </Animated.View>
        )}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    fontWeight: '800',
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryTint,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  historyBtnText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  previewContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  imagePreview: { width: '100%', height: '100%' },
  placeholder: { flex: 1 },
  placeholderGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  placeholderText: {
    ...typography.body,
    color: colors.primary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...shadows.lg,
  },
  loadingText: {
    ...typography.bodyBold,
    color: colors.primary,
    marginTop: spacing.md,
  },
  actionButtons: { gap: spacing.md },
  primaryActionBtn: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  actionBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  actionBtnText: {
    ...typography.bodyBold,
    color: colors.white,
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  secondaryBtnText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  resultCard: {
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  statusText: {
    ...typography.h2,
    color: colors.white,
    fontWeight: '800',
  },
  resultContent: { padding: spacing.lg },
  productName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontWeight: '700',
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  confidenceLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    width: 72,
  },
  confidenceBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceValue: {
    ...typography.captionBold,
    width: 36,
    textAlign: 'right',
  },
  section: { marginBottom: spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.smallBold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reasonText: {
    ...typography.body,
    color: colors.text,
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
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ingredientText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    margin: spacing.lg,
    marginTop: 0,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  resetButtonText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  // History styles
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  historyTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
  },
  backBtn: {
    padding: spacing.sm,
    width: 40,
  },
  historyList: {
    padding: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    ...shadows.sm,
    marginBottom: spacing.sm,
  },
  historyStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  historyContent: { flex: 1 },
  historyProductName: {
    ...typography.bodyBold,
    color: colors.text,
  },
  historyDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  historyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  historyBadgeText: {
    ...typography.captionBold,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xxxxl,
    gap: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
