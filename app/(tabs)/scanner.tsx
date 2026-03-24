import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, Alert, Pressable } from 'react-native';
import { Container, Button, Card } from '@/components/ui';
import { useI18n } from '@/lib/i18n';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/design';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { blink } from '@/lib/blink';
import { useBlinkAuth } from '@blinkdotnew/react-native';

interface AnalysisResult {
  status: 'halal' | 'haram' | 'doubtful';
  reason: string;
  ingredients: string[];
}

export default function ScannerScreen() {
  const { t, language } = useI18n();
  const { isAuthenticated } = useBlinkAuth();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const analyzeImage = async (uri: string) => {
    if (!isAuthenticated) {
      Alert.alert('Authentication Required', 'Please sign in to use the AI scanner', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => blink.auth.login() }
      ]);
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // 1. Upload image to get public URL
      const extension = uri.split('.').pop() || 'jpg';
      const file = {
        uri,
        name: `product_${Date.now()}.${extension}`,
        type: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
      } as any;

      const { publicUrl } = await blink.storage.upload(file, `scanner/${file.name}`);

      // 2. Analyze with AI
      const systemPrompt = `You are an expert Islamic Halal food consultant. 
Analyze the image of this product or its ingredients list. 
Determine if it is Halal, Haram, or Doubtful (Mushbooh) according to Islamic principles.
Consider common E-numbers and ingredients found in Russia and Europe.

Respond with ONLY a JSON object in this format:
{
  "status": "halal" | "haram" | "doubtful",
  "reason": "Clear explanation in ${language === 'ru' ? 'Russian' : language === 'ar' ? 'Arabic' : 'English'}",
  "ingredients": ["list", "of", "concerning", "or", "safe", "ingredients"]
}`;

      const { text } = await blink.ai.generateText({
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: 'Please analyze this product.' },
              { type: 'image', image: publicUrl }
            ]
          }
        ]
      });

      const parsedResult = JSON.parse(text.replace(/```json\n?|\n?```/g, '')) as AnalysisResult;
      setResult(parsedResult);
    } catch (error) {
      console.error('AI Analysis failed:', error);
      Alert.alert('Error', 'Failed to analyze the image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: AnalysisResult['status']) => {
    switch (status) {
      case 'halal': return colors.success;
      case 'haram': return colors.error;
      case 'doubtful': return colors.warning;
      default: return colors.primary;
    }
  };

  const getStatusLabel = (status: AnalysisResult['status']) => {
    switch (status) {
      case 'halal': return t('halal');
      case 'haram': return t('haram');
      case 'doubtful': return t('doubtful');
      default: return '';
    }
  };

  return (
    <Container safeArea edges={['bottom']} padding="lg" style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('scanner')}</Text>
          <Text style={styles.subtitle}>{t('scanProduct')}</Text>
        </View>

        {!image && (
          <View style={styles.actions}>
            <Pressable style={styles.actionButton} onPress={takePhoto}>
              <Ionicons name="camera" size={32} color={colors.primary} />
              <Text style={styles.actionText}>Take Photo</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={pickImage}>
              <Ionicons name="images" size={32} color={colors.primary} />
              <Text style={styles.actionText}>Gallery</Text>
            </Pressable>
          </View>
        )}

        {image && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: image }} style={styles.previewImage} />
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.white} />
                <Text style={styles.loadingText}>AI is analyzing...</Text>
              </View>
            )}
            {!loading && (
              <Button 
                variant="outline" 
                style={styles.retakeButton} 
                onPress={() => { setImage(null); setResult(null); }}
              >
                Retake
              </Button>
            )}
          </View>
        )}

        {result && (
          <Card variant="elevated" style={[styles.resultCard, { borderColor: getStatusColor(result.status), borderWidth: 2 }]}>
            <Card.Content>
              <View style={styles.resultHeader}>
                <Ionicons 
                  name={result.status === 'halal' ? 'checkmark-circle' : result.status === 'haram' ? 'close-circle' : 'alert-circle'} 
                  size={32} 
                  color={getStatusColor(result.status)} 
                />
                <Text style={[styles.resultStatus, { color: getStatusColor(result.status) }]}>
                  {getStatusLabel(result.status).toUpperCase()}
                </Text>
              </View>
              
              <Text style={styles.reasonText}>{result.reason}</Text>
              
              {result.ingredients.length > 0 && (
                <View style={styles.ingredientsContainer}>
                  <Text style={styles.ingredientsTitle}>Analyzed Ingredients:</Text>
                  <View style={styles.ingredientsList}>
                    {result.ingredients.map((ing, i) => (
                      <View key={i} style={styles.ingredientBadge}>
                        <Text style={styles.ingredientText}>{ing}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
  actionButton: {
    flex: 1,
    height: 120,
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  actionText: {
    ...typography.captionBold,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  previewContainer: {
    width: '100%',
    height: 300,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.lg,
    marginBottom: spacing.xl,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.captionBold,
    color: colors.white,
    marginTop: spacing.md,
  },
  retakeButton: {
    position: 'absolute',
    bottom: spacing.md,
    alignSelf: 'center',
    backgroundColor: colors.white,
  },
  resultCard: {
    borderRadius: borderRadius.xl,
    backgroundColor: colors.white,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  resultStatus: {
    ...typography.h2,
    fontWeight: '700',
  },
  reasonText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  ingredientsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  ingredientsTitle: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  ingredientBadge: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ingredientText: {
    ...typography.small,
    color: colors.text,
  },
});
