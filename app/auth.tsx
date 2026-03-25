import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/design';
import { useLanguageStore } from '@/hooks/useLanguage';
import { blink } from '@/lib/blink';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { Input } from '@/components/ui';

export default function AuthScreen() {
  const { language } = useLanguageStore();
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    const unsub = blink.auth.onAuthStateChanged((state: any) => {
      if (state.user && !state.isLoading) {
        router.replace('/(tabs)');
      }
    });
    return unsub;
  }, []);

  const t = {
    signIn: language === 'ar' ? 'تسجيل الدخول' : language === 'ru' ? 'Войти' : 'Sign In',
    signUp: language === 'ar' ? 'إنشاء حساب' : language === 'ru' ? 'Регистрация' : 'Sign Up',
    email: language === 'ar' ? 'البريد الإلكتروني' : language === 'ru' ? 'Email' : 'Email',
    password: language === 'ar' ? 'كلمة المرور' : language === 'ru' ? 'Пароль' : 'Password',
    name: language === 'ar' ? 'الاسم' : language === 'ru' ? 'Имя' : 'Full Name',
    continueWith: language === 'ar' ? 'أو تابع مع' : language === 'ru' ? 'Или войти через' : 'Or continue with',
    noAccount: language === 'ar' ? 'ليس لديك حساب؟' : language === 'ru' ? 'Нет аккаунта?' : "Don't have an account?",
    hasAccount: language === 'ar' ? 'لديك حساب بالفعل؟' : language === 'ru' ? 'Уже есть аккаунт?' : 'Already have an account?',
    skip: language === 'ar' ? 'تخطي' : language === 'ru' ? 'Продолжить без входа' : 'Continue without signing in',
    welcomeBack: language === 'ar' ? 'مرحباً بعودتك' : language === 'ru' ? 'С возвращением' : 'Welcome Back',
    createAccount: language === 'ar' ? 'إنشاء حساب جديد' : language === 'ru' ? 'Создать аккаунт' : 'Create Account',
    subtitle: language === 'ar' ? 'سجّل لحفظ تقدمك وإحصاءاتك' : language === 'ru' ? 'Войдите чтобы сохранить прогресс и статистику' : 'Sign in to save your progress and stats',
    fillAll: language === 'ar' ? 'يرجى ملء جميع الحقول' : language === 'ru' ? 'Заполните все поля' : 'Please fill all fields',
    errOccurred: language === 'ar' ? 'حدث خطأ ما' : language === 'ru' ? 'Произошла ошибка' : 'An error occurred',
  };

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setError(t.fillAll);
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await blink.auth.signInWithEmail(email.trim(), password);
      } else {
        await blink.auth.signUp({
          email: email.trim(),
          password,
          displayName: displayName.trim() || undefined,
        });
      }
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err?.message || t.errOccurred);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      await blink.auth.signInWithGoogle();
      router.replace('/(tabs)');
    } catch (err: any) {
      if (!err?.message?.toLowerCase().includes('cancel')) {
        setError(err?.message || 'Google sign-in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGitHub = async () => {
    setLoading(true);
    setError('');
    try {
      await blink.auth.signInWithGitHub();
      router.replace('/(tabs)');
    } catch (err: any) {
      if (!err?.message?.toLowerCase().includes('cancel')) {
        setError(err?.message || 'GitHub sign-in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#022C22', '#064E3B', '#0A0A0A']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 0.65 }}
      />

      {/* Geometric decorative circles */}
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={[
            styles.geoDot,
            {
              left: i % 2 === 0 ? 20 + i * 80 : 60 + i * 60,
              top: i < 2 ? -20 : 180 + i * 30,
              width: 80 + i * 20,
              height: 80 + i * 20,
              borderRadius: (80 + i * 20) / 2,
              opacity: 0.06 + i * 0.01,
            },
          ]}
        />
      ))}

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <Animated.View entering={FadeIn.delay(0)} style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.gold} />
          </Pressable>

          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['rgba(201,168,76,0.2)', 'rgba(201,168,76,0.05)']}
              style={styles.logoRing}
            >
              <Ionicons name="moon" size={38} color={colors.gold} />
            </LinearGradient>
            <Text style={styles.appName}>iMuslim Russia</Text>
          </View>

          <Text style={styles.authTitle}>{isLogin ? t.welcomeBack : t.createAccount}</Text>
          <Text style={styles.authSubtitle}>{t.subtitle}</Text>
        </Animated.View>

        {/* ── Form Card ── */}
        <Animated.View entering={FadeInUp.delay(150)} style={styles.formCard}>
          {!isLogin && (
            <Input
              label={t.name}
              value={displayName}
              onChangeText={setDisplayName}
              leftIcon={<Ionicons name="person-outline" size={18} color={colors.textTertiary} />}
              containerStyle={styles.inputContainer}
            />
          )}

          <Input
            label={t.email}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textTertiary} />}
            containerStyle={styles.inputContainer}
          />

          <Input
            label={t.password}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textTertiary} />}
            containerStyle={styles.inputContainer}
          />

          {!!error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Primary CTA */}
          <Pressable
            style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
            onPress={handleEmailAuth}
            disabled={loading}
          >
            <LinearGradient colors={['#065F46', '#022C22']} style={styles.primaryBtnGradient}>
              {loading ? (
                <ActivityIndicator color={colors.gold} size="small" />
              ) : (
                <>
                  <Ionicons
                    name={isLogin ? 'log-in-outline' : 'person-add-outline'}
                    size={20}
                    color={colors.gold}
                  />
                  <Text style={styles.primaryBtnText}>{isLogin ? t.signIn : t.signUp}</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t.continueWith}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialRow}>
            <Pressable style={styles.socialBtn} onPress={handleGoogle} disabled={loading}>
              <View style={styles.socialBtnInner}>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.socialBtnText}>Google</Text>
              </View>
            </Pressable>

            <Pressable style={styles.socialBtn} onPress={handleGitHub} disabled={loading}>
              <View style={styles.socialBtnInner}>
                <Ionicons name="logo-github" size={20} color={colors.text} />
                <Text style={styles.socialBtnText}>GitHub</Text>
              </View>
            </Pressable>
          </View>

          {/* Toggle */}
          <Pressable
            onPress={() => { setIsLogin(!isLogin); setError(''); }}
            style={styles.toggleRow}
          >
            <Text style={styles.toggleText}>{isLogin ? t.noAccount : t.hasAccount}</Text>
            <Text style={styles.toggleLink}> {isLogin ? t.signUp : t.signIn}</Text>
          </Pressable>
        </Animated.View>

        {/* Skip */}
        <Animated.View entering={FadeInUp.delay(300)}>
          <Pressable onPress={() => router.replace('/(tabs)')} style={styles.skipBtn}>
            <Text style={styles.skipText}>{t.skip}</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.textTertiary} />
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.xxxxl },

  geoDot: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.35)',
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  backBtn: {
    alignSelf: 'flex-start',
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  logoContainer: { alignItems: 'center', marginBottom: spacing.md },
  logoRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(201,168,76,0.35)',
    marginBottom: spacing.sm,
  },
  appName: {
    ...typography.captionBold,
    color: colors.gold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  authTitle: {
    ...typography.h1,
    color: colors.text,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  authSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },

  // ── Form ────────────────────────────────────────────────────────────────────
  formCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.lg,
    marginBottom: spacing.lg,
  },
  inputContainer: { marginBottom: spacing.md },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(220,38,38,0.1)',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.2)',
  },
  errorText: { ...typography.small, color: colors.error, flex: 1 },

  primaryBtn: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  primaryBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md + 2,
  },
  primaryBtnText: {
    ...typography.bodyBold,
    color: colors.gold,
    fontWeight: '700',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { ...typography.small, color: colors.textTertiary },

  socialRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  socialBtn: {
    flex: 1,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.backgroundElevated,
    overflow: 'hidden',
    ...shadows.sm,
  },
  socialBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4285F4',
  },
  socialBtnText: { ...typography.captionBold, color: colors.text },

  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: { ...typography.caption, color: colors.textSecondary },
  toggleLink: { ...typography.captionBold, color: colors.gold },

  // ── Skip ────────────────────────────────────────────────────────────────────
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  skipText: { ...typography.caption, color: colors.textTertiary },
});
