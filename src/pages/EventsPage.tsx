// ═══════════════════════════════════════════════════════════════════════════
// Islamic Events Page - Muslim Russia
// ═══════════════════════════════════════════════════════════════════════════

import { useI18n } from '../lib/i18n'
import { useState } from 'react'
import { Page, PageHeader, PageTitle, PageBody, Card, CardHeader, CardTitle, CardContent, Tabs, TabsList, TabsTrigger, TabsContent } from '@blinkdotnew/ui'
import { Calendar, Star, Moon, Sun, ChevronRight, Plus } from 'lucide-react'

interface IslamicEvent {
  id: string
  name: string
  nameRu: string
  nameAr: string
  date: string
  hijri: string
  type: 'holiday' | 'commemoration' | 'religious'
  description: string
  descriptionRu: string
  descriptionAr: string
}

const events: IslamicEvent[] = [
  { id: '1', name: 'Ramadan Start', nameRu: 'Начало Рамадана', nameAr: 'بداية رمضان', date: '2026-02-17', hijri: '1447-09-17', type: 'holiday', description: 'First day of the holy month of Ramadan', descriptionRu: 'Первый день священного месяца Рамадан', descriptionAr: 'اليوم الأول من شهر رمضان الكريم' },
  { id: '2', name: 'Laylat al-Qadr', nameRu: 'Ночь Предопределения', nameAr: 'ليلة القدر', date: '2026-03-06', hijri: '1447-10-26', type: 'religious', description: 'Night of power - better than a thousand months', descriptionRu: 'Ночь предопределения - лучше тысячи месяцев', descriptionAr: 'ليلة القدر خير من ألف شهر' },
  { id: '3', name: 'Eid al-Fitr', nameRu: 'Ураза-байрам', nameAr: 'عيد الفطر', date: '2026-03-18', hijri: '1447-10-01', type: 'holiday', description: 'Festival of breaking the fast', descriptionRu: 'Праздник разговения', descriptionAr: 'عيد الفطر المبارك' },
  { id: '4', name: 'Hijri New Year', nameRu: 'Новый год по хиджре', nameAr: 'السنة الهجرية', date: '2026-06-27', hijri: '1448-01-01', type: 'holiday', description: 'Islamic New Year', descriptionRu: 'Новый год по исламскому календарю', descriptionAr: 'السنة الجديدة الهجرية' },
  { id: '5', name: 'Ashura', nameRu: 'Ашура', nameAr: 'عاشوراء', date: '2026-07-15', hijri: '1448-02-10', type: 'commemoration', description: 'Day of remembrance, fasting recommended', descriptionRu: 'День поминания, пост желателен', descriptionAr: 'يوم الذكرى، الصوم مستحب' },
  { id: '6', name: 'Mawlid al-Nabi', nameRu: 'День рождения пророка', nameAr: 'المولد النبوي', date: '2026-09-04', hijri: '1448-04-12', type: 'holiday', description: 'Celebration of Prophet Muhammad\'s birthday', descriptionRu: 'Праздник рождения пророка Мухаммада', descriptionAr: 'احتفال بمولد النبي محمد ﷺ' },
  { id: '7', name: 'Isra and Mi\'raj', nameRu: 'Мирадж', nameAr: 'الإسراء والمعراج', date: '2026-02-04', hijri: '1447-09-04', type: 'religious', description: 'Prophet\'s night journey and ascension', descriptionRu: 'Ночное путешествие и вознесение пророка', descriptionAr: 'الإسراء والمعراج النبي' },
  { id: '8', name: 'Eid al-Adha', nameRu: 'Курбан-байрам', nameAr: 'عيد الأضحى', date: '2026-08-08', hijri: '1448-12-09', type: 'holiday', description: 'Festival of sacrifice', descriptionRu: 'Праздник жертвоприношения', descriptionAr: 'عيد الأضحى المبارك' },
]

export default function EventsPage() {
  const { t, language } = useI18n()
  const [selectedTab, setSelectedTab] = useState('upcoming')
  
  const isRTL = language === 'ar'
  
  const getEventName = (event: IslamicEvent) => {
    return language === 'ar' ? event.nameAr : language === 'ru' ? event.nameRu : event.name
  }
  
  const getEventDesc = (event: IslamicEvent) => {
    return language === 'ar' ? event.descriptionAr : language === 'ru' ? event.descriptionRu : event.description
  }

  const now = new Date()
  const upcomingEvents = events.filter(e => new Date(e.date) >= now).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const pastEvents = events.filter(e => new Date(e.date) < now).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'holiday': return <Star className="w-4 h-4 text-amber-500" />
      case 'religious': return <Moon className="w-4 h-4 text-violet-500" />
      case 'commemoration': return <Sun className="w-4 h-4 text-orange-500" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <Page>
      <PageHeader>
        <PageTitle>{t.events.title}</PageTitle>
      </PageHeader>
      <PageBody className="p-4 md:p-6 space-y-6">
        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="w-full">
            <TabsTrigger value="upcoming" className="flex-1">
              {t.events.upcoming} ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="flex-1">
              {t.events.past} ({pastEvents.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="mt-6 space-y-4">
            {upcomingEvents.map((event, index) => (
              <Card key={event.id} className={`overflow-hidden animate-fade-in stagger-${index + 1}`}>
                <div className={`flex ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-2 ${event.type === 'holiday' ? 'bg-amber-500' : event.type === 'religious' ? 'bg-violet-500' : 'bg-orange-500'}`} />
                  <CardContent className="flex-1 p-4">
                    <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getEventIcon(event.type)}
                          <span className="text-sm text-muted-foreground">{event.type}</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-1">{getEventName(event)}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{getEventDesc(event)}</p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Moon className="w-4 h-4 text-primary" />
                            <span>{event.hijri}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-muted-foreground ${isRTL ? 'rotate-180' : ''}`} />
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="past" className="mt-6 space-y-4">
            {pastEvents.map((event, index) => (
              <Card key={event.id} className="opacity-70 animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getEventIcon(event.type)}
                    <span className="text-sm text-muted-foreground">{event.type}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{getEventName(event)}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{getEventDesc(event)}</p>
                  <div className="flex gap-4 text-sm">
                    <span>{formatDate(event.date)}</span>
                    <span>{event.hijri}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Calendar Info */}
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="text-base">
              {language === 'ar' ? 'التقويم الهجري' : language === 'ru' ? 'Исламский календарь' : 'Hijri Calendar'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'التقويم الإسلامي يعتمد على دورة القمر._year Hijri يبدأ من هجرة النبي محمد ﷺ.' : language === 'ru' ? 'Исламский календарь основан на лунном цикле. Новый год хиджры начинается с момента переселения пророка Мухаммада.' : 'The Islamic calendar is based on the lunar cycle. The Hijri year begins from the migration of Prophet Muhammad.'}
            </p>
          </CardContent>
        </Card>
      </PageBody>
    </Page>
  )
}