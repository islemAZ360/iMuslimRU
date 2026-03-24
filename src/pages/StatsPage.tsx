// ═══════════════════════════════════════════════════════════════════════════
// Statistics Page - Muslim Russia
// Personal worship tracking
// ═══════════════════════════════════════════════════════════════════════════

import { useI18n } from '../lib/i18n'
import { useState } from 'react'
import { Page, PageHeader, PageTitle, PageBody, Card, CardHeader, CardTitle, CardContent, Stat, StatGroup, Tabs, TabsList, TabsTrigger, TabsContent } from '@blinkdotnew/ui'
import { Target, Flame, BookOpen, Heart, TrendingUp, Calendar, Award, Star } from 'lucide-react'

interface DailyStats {
  date: string
  prayers: number
  fasting: boolean
  quran: number
  charity: boolean
}

// Generate mock data for the last 30 days
function generateMockStats(): DailyStats[] {
  const stats: DailyStats[] = []
  const today = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    stats.push({
      date: date.toISOString().split('T')[0],
      prayers: Math.floor(Math.random() * 6),
      fasting: Math.random() > 0.5,
      quran: Math.floor(Math.random() * 10),
      charity: Math.random() > 0.8
    })
  }
  return stats
}

export default function StatsPage() {
  const { t, language } = useI18n()
  const [stats] = useState(generateMockStats())
  const [period, setPeriod] = useState('weekly')
  
  const isRTL = language === 'ar'

  // Calculate totals
  const totalPrayers = stats.reduce((sum, day) => sum + day.prayers, 0)
  const totalFastingDays = stats.filter(day => day.fasting).length
  const totalQuranPages = stats.reduce((sum, day) => sum + day.quran, 0)
  const totalCharity = stats.filter(day => day.charity).length
  
  // Streak calculation
  let currentStreak = 0
  for (let i = stats.length - 1; i >= 0; i--) {
    if (stats[i].prayers >= 5) currentStreak++
    else break
  }

  // Weekly data (last 7 days)
  const weeklyData = stats.slice(-7)
  const weeklyPrayers = weeklyData.reduce((sum, day) => sum + day.prayers, 0)
  const weeklyFasting = weeklyData.filter(d => d.fasting).length
  const weeklyQuran = weeklyData.reduce((sum, day) => sum + day.quran, 0)

  // Monthly data (last 30 days)
  const monthlyPrayers = totalPrayers
  const monthlyFasting = totalFastingDays
  const monthlyQuran = totalQuranPages

  const statCards = [
    { icon: Target, label: t.stats.prayers, value: period === 'weekly' ? weeklyPrayers : monthlyPrayers, max: period === 'weekly' ? 35 : 150, color: 'from-emerald-500 to-teal-600' },
    { icon: Flame, label: t.stats.fasting, value: period === 'weekly' ? weeklyFasting : monthlyFasting, max: period === 'weekly' ? 7 : 30, color: 'from-orange-500 to-amber-600' },
    { icon: BookOpen, label: t.stats.quran, value: period === 'weekly' ? weeklyQuran : monthlyQuran, max: period === 'weekly' ? 70 : 300, color: 'from-violet-500 to-purple-600' },
    { icon: Heart, label: t.stats.charity, value: period === 'weekly' ? stats.slice(-7).filter(d => d.charity).length : totalCharity, max: 30, color: 'from-rose-500 to-pink-600' },
  ]

  return (
    <Page>
      <PageHeader>
        <PageTitle>{t.stats.title}</PageTitle>
      </PageHeader>
      <PageBody className="p-4 md:p-6 space-y-6">
        {/* Streak Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-6 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm opacity-80">{t.stats.streak}</div>
                <div className="text-5xl font-bold">{currentStreak}</div>
                <div className="text-sm opacity-80">
                  {language === 'ar' ? 'أيام متتالية' : language === 'ru' ? 'дней подряд' : 'consecutive days'}
                </div>
              </div>
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                <Award className="w-10 h-10" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-300" />
              <span className="text-sm">
                {language === 'ar' ? 'ممتاز! واصل هكذا' : language === 'ru' ? 'Отлично! Продолжайте' : 'Great! Keep it up'}
              </span>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList className="w-full">
            <TabsTrigger value="weekly" className="flex-1">{t.stats.weekly}</TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1">{t.stats.monthly}</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {statCards.map((stat, index) => (
            <Card key={stat.label} className={`overflow-hidden animate-fade-in stagger-${index + 1}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
              <CardContent className="p-4 relative z-10">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${stat.color}`}
                    style={{ width: `${(stat.value / stat.max) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Activity Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {language === 'ar' ? 'النشاط الأسبوعي' : language === 'ru' ? 'Недельная активность' : 'Weekly Activity'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-end justify-between gap-2">
              {weeklyData.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-primary to-primary-glow rounded-t"
                    style={{ height: `${(day.prayers / 5) * 100}%`, minHeight: '4px' }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {new Date(day.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'short' }).slice(0, 2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-primary" />
                <span>{t.stats.prayers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              {language === 'ar' ? 'الإنجازات' : language === 'ru' ? 'Достижения' : 'Achievements'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: language === 'ar' ? 'أول صلاة' : language === 'ru' ? 'Первый намаз' : 'First Prayer', earned: true, icon: '🕌' },
              { title: language === 'ar' ? 'أسبوع متتابع' : language === 'ru' ? 'Неделя подряд' : 'Week Streak', earned: currentStreak >= 7, icon: '🔥' },
              { title: language === 'ar' ? 'شهر كامل' : language === 'ru' ? 'Целый месяц' : 'Full Month', earned: currentStreak >= 30, icon: '⭐' },
              { title: language === 'ar' ? 'ختم القرآن' : language === 'ru' ? 'Хафиз Корана' : 'Quran Completion', earned: totalQuranPages >= 604, icon: '📖' },
            ].map((achievement, index) => (
              <div 
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg ${achievement.earned ? 'bg-primary/10' : 'bg-muted/50 opacity-50'}`}
              >
                <span className="text-2xl">{achievement.icon}</span>
                <div className="flex-1">
                  <div className={`font-medium ${achievement.earned ? '' : 'text-muted-foreground'}`}>
                    {achievement.title}
                  </div>
                </div>
                {achievement.earned && <Star className="w-5 h-5 text-amber-500" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">
                  {language === 'ar' ? 'نصائح لتحسين عبادتك' : language === 'ru' ? 'Советы по улучшению поклонения' : 'Tips to Improve Your Worship'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'خصص وقتًا للصلاة في mosque والحفاظ على أذكار الصباح والمساء.' : language === 'ru' ? 'Выделите время для намаза в мечети и не забывайте про утренние и вечерние зикры.' : 'Set aside time for prayer at the mosque and maintain morning and evening azkar.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageBody>
    </Page>
  )
}