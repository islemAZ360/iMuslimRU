// ═══════════════════════════════════════════════════════════════════════════
// Ramadan Page - Muslim Russia
// ═══════════════════════════════════════════════════════════════════════════

import { useI18n } from '../lib/i18n'
import { useState, useEffect } from 'react'
import { Page, PageHeader, PageTitle, PageBody, Card, CardHeader, CardTitle, CardContent } from '@blinkdotnew/ui'
import { Moon, Calendar, BookOpen, Heart, Flame, Star, Clock, CheckCircle } from 'lucide-react'

interface RamadanData {
  date: string
  day: number
  suhoor: string
  iftar: string
}

// Calculate Ramadan countdown (approximate - 2026 starts around Feb 17)
function getRamadanData(): RamadanData[] {
  const ramadanStart = new Date('2026-02-17')
  const data: RamadanData[] = []
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(ramadanStart)
    date.setDate(date.getDate() + i)
    data.push({
      date: date.toISOString().split('T')[0],
      day: i + 1,
      suhoor: '05:30',
      iftar: '18:45'
    })
  }
  return data
}

const duas = [
  { arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', transliteration: 'Rabbanaatina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhab an-nar', translation: 'Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire' },
  { arabic: 'اللَّهُمَّ اجْعَلْنِي مُسْلِماً وَاجْعَلْنِي مُقْبِلاً', transliteration: 'Allahummaj\'alni Musliman wa j\'alni Muqballan', translation: 'O Allah, make me a Muslim and make me acceptable [to You]' },
  { arabic: 'سُبْحَانَ رَبِّكَ رَبِّ الْعِزَّةِ عَمَّا يَصِفُونَ وَسَلَامٌ عَلَى الْمُرْسَلِينَ وَالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', transliteration: 'Subhana rabbika rabbil-\'izzati \'amma yasifuna wa salamun \'alal-mursalin wal-hamdu lillahi rabbil-\'alamin', translation: 'Glory be to your Lord, the Lord of might, above what they describe. And peace be upon the messengers. And praise be to Allah, the Lord of the worlds.' },
]

export default function RamadanPage() {
  const { t, language } = useI18n()
  const [ramadanData] = useState(getRamadanData())
  const [today, setToday] = useState(1)
  const [completed, setCompleted] = useState<number[]>([])
  
  const isRTL = language === 'ar'
  
  // Current date for demo
  useEffect(() => {
    const now = new Date()
    const ramadanStart = new Date('2026-02-17')
    const diff = Math.floor((now.getTime() - ramadanStart.getTime()) / 86400000)
    setToday(Math.max(1, Math.min(diff + 1, 30)))
  }, [])

  const currentRamadanDay = ramadanData.find(d => d.day === today)

  const toggleComplete = (day: number) => {
    setCompleted(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  return (
    <Page>
      <PageHeader>
        <PageTitle>{t.ramadan.title}</PageTitle>
      </PageHeader>
      <PageBody className="p-4 md:p-6 space-y-6">
        {/* Countdown/Status */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-6 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAwIEw0MCAzNiBMMzYgNzIgTDI4IDM2WiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L2c+PC9zdmc+')] opacity-20" />
          <div className="relative z-10 text-center">
            <Moon className="w-16 h-16 mx-auto mb-4 text-amber-300" />
            <div className="text-7xl font-bold mb-2">{today}</div>
            <div className="text-xl opacity-90">
              {language === 'ar' ? 'يوم من رمضان' : language === 'ru' ? 'день Рамадана' : 'day of Ramadan'}
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4" />
                <span>{completed.length}/30</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-300" />
                <span>{Math.round((completed.length / 30) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Suhoor & Iftar Times */}
        {currentRamadanDay && (
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-sm text-muted-foreground mb-1">{t.ramadan.suhoor}</div>
                <div className="text-2xl font-bold text-blue-600">{currentRamadanDay.suhoor}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                  <Moon className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-sm text-muted-foreground mb-1">{t.ramadan.iftar}</div>
                <div className="text-2xl font-bold text-orange-600">{currentRamadanDay.iftar}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Fasting Tracker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {t.ramadan.fastingTracker}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 md:grid-cols-6 gap-2">
              {ramadanData.slice(0, 30).map(day => (
                <button
                  key={day.day}
                  onClick={() => toggleComplete(day.day)}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                    completed.includes(day.day) 
                      ? 'bg-green-500 text-white' 
                      : day.day === today 
                        ? 'bg-primary text-white ring-2 ring-primary/30' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {completed.includes(day.day) ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    day.day
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Duas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {t.ramadan.dua}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {duas.map((dua, index) => (
              <div key={index} className="p-4 bg-muted/50 rounded-xl">
                <p className="text-xl font-serif text-primary mb-2 text-right" dir="rtl">
                  {dua.arabic}
                </p>
                <p className="text-sm text-muted-foreground italic mb-1">
                  {dua.transliteration}
                </p>
                <p className="text-sm">
                  {dua.translation}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Ramadan Tips */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              {language === 'ar' ? 'نصائح رمضانية' : language === 'ru' ? 'Советы по Рамадану' : 'Ramadan Tips'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              language === 'ar' ? 'اشرب الماء بكثرة بين الإفطار والسحور' : language === 'ru' ? 'Пейте много воды между ифтаром и сухуром' : 'Drink plenty of water between iftar and suhoor',
              language === 'ar' ? 'لا تكثر من الأ foods المقلية عند الإفطار' : language === 'ru' ? 'Не злоупотребляйте жареной пищей при ифтаре' : 'Don\'t overeat fried foods at iftar',
              language === 'ar' ? 'صلِ Tarawih في mosque كل ليلة إن أمكن' : language === 'ru' ? 'Посещайте мечеть для тарауих каждый вечер' : 'Attend Tarawih at the mosque every night if possible',
              language === 'ar' ? ' اقرأ جزءًا من القرآن يوميًا' : language === 'ru' ? 'Читайте часть Корана каждый день' : 'Read a portion of the Quran daily',
            ].map((tip, index) => (
              <div key={index} className="flex items-start gap-3">
                <Star className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                <span className="text-sm">{tip}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </PageBody>
    </Page>
  )
}