import { View, Text, StyleSheet, Pressable, Platform, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { Container, Button, Card } from '@/components/ui';
import { colors, spacing, typography, shadows, borderRadius } from '@/constants/design';
import { useLanguageStore } from '@/hooks/useLanguage';
import { translations } from '@/constants/translations';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { blink } from '@/lib/blink';

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
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

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
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      processImage(result.assets[0].uri);
    }
  };

  const handlePickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      processImage(result.assets[0].uri);
    }
  };

  const processImage = async (uri: string) => {
    setImage(uri);
    setResult(null);
    setLoading(true);

    try {
      // 1. Upload to Blink Storage
      const filename = uri.split('/').pop() || `scan_${Date.now()}.jpg`;
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const { publicUrl } = await blink.storage.upload(
        blob as unknown as File,
        `scans/${Date.now()}_${filename}`
      );

      // 2. Generate AI Analysis
      const languageName = language === 'ru' ? 'Russian' : language === 'ar' ? 'Arabic' : 'English';
      
      const { object } = await blink.ai.generateObject({
        prompt: `You are a "Halal Food Expert". Analyze the ingredients of this product from the image: ${publicUrl}. 
        Identify the product name and determine if it is Halal, Haram, or Doubtful (Mushbooh).
        Explain why it is categorized as such based on Islamic dietary laws.
        Consider additives, E-numbers, and animal-derived ingredients.
        Return a JSON object in this format:
        {
          "productName": "string",
          "status": "Halal" | "Haram" | "Doubtful",
          "ingredients": ["string"],
          "reason": "string explaining the decision",
          "confidence": number between 0 and 1
        }
        Please provide the "productName" and "reason" in ${languageName} language.`,
        schema: {
          type: 'object',
          properties: {
            productName: { type: 'string' },
            status: { type: 'string', enum: ['Halal', 'Haram', 'Doubtful'] },
            ingredients: { type: 'array', items: { type: 'string' } },
            reason: { type: 'string' },
            confidence: { type: 'number' }
          },
          required: ['productName', 'status', 'ingredients', 'reason', 'confidence']
        }
      });

      const scanData = object as ScanResult;
      setResult(scanData);

      // 3. Save to database
      const userId = (await blink.auth.getSession())?.user?.id || 'guest_user';
      
      await blink.db.halal_scans.create({
        userId,
        imageUrl: publicUrl,
        productName: scanData.productName,
        result: scanData.status,
        reason: scanData.reason,
        ingredients: JSON.stringify(scanData.ingredients),
        confidence: scanData.confidence
      });

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
      case 'Doubtful': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Halal': return t.resultHalal;
      case 'Haram': return t.resultHaram;
      case 'Doubtful': return t.resultMushbooh;
      default: return status;
    }
  };

  return (
    <Container style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t.title}</Text>
        
        <View style={styles.previewContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="scan-outline" size={80} color={colors.textTertiary} />
              <Text style={styles.placeholderText}>{t.ready}</Text>
            </View>
          )}
          
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>{t.scanning}</Text>
            </View>
          )}
        </View>

        {!loading && !result && (
          <View style={styles.actionButtons}>
            <Button 
              variant="primary" 
              onPress={handleTakePhoto}
              icon={<Ionicons name="camera" size={20} color={colors.white} />}
              style={styles.actionButton}
            >
              {t.takePhoto}
            </Button>
            <Button 
              variant="outline" 
              onPress={handlePickImage}
              icon={<Ionicons name="images" size={20} color={colors.primary} />}
              style={styles.actionButton}
            >
              {t.selectImage}
            </Button>
          </View>
        )}

        {result && (
          <Card variant="elevated" style={styles.resultCard}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(result.status) }]}>
              <Ionicons 
                name={result.status === 'Halal' ? 'checkmark-circle' : result.status === 'Haram' ? 'close-circle' : 'help-circle'} 
                size={24} 
                color={colors.white} 
              />
              <Text style={styles.statusText}>{getStatusText(result.status)}</Text>
            </View>

            <View style={styles.resultContent}>
              <Text style={styles.productName}>{result.productName}</Text>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t.reason}</Text>
                <Text style={styles.reasonText}>{result.reason}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t.ingredients}</Text>
                <View style={styles.ingredientsList}>
                  {result.ingredients.map((item, index) => (
                    <View key={index} style={styles.ingredientTag}>
                      <Text style={styles.ingredientText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.confidenceContainer}>
                <Text style={styles.confidenceLabel}>{t.confidence}:</Text>
                <View style={styles.confidenceBarBg}>
                  <View 
                    style={[
                      styles.confidenceBarFill, 
                      { width: `${result.confidence * 100}%`, backgroundColor: getStatusColor(result.status) }
                    ]} 
                  />
                </View>
                <Text style={styles.confidenceValue}>{Math.round(result.confidence * 100)}%</Text>
              </View>
            </View>

            <Button 
              variant="outline" 
              onPress={() => { setResult(null); setImage(null); }}
              style={styles.resetButton}
            >
              {t.scanButton}
            </Button>
          </Card>
        )}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  previewContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodyBold,
    color: colors.primary,
    marginTop: spacing.md,
  },
  actionButtons: {
    gap: spacing.md,
  },
  actionButton: {
    width: '100%',
  },
  resultCard: {
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  statusText: {
    ...typography.h2,
    color: colors.white,
  },
  resultContent: {
    padding: spacing.lg,
  },
  productName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.smallBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
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
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  ingredientText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  confidenceLabel: {
    ...typography.smallBold,
    color: colors.textSecondary,
  },
  confidenceBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceValue: {
    ...typography.smallBold,
    color: colors.text,
    width: 40,
  },
  resetButton: {
    margin: spacing.lg,
    marginTop: 0,
  },
});
