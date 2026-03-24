// ═══════════════════════════════════════════════════════════════════════════
// Settings Page - Muslim Russia
// ═══════════════════════════════════════════════════════════════════════════

import { useI18n, languages, Language } from '../lib/i18n'
import { useState, useEffect } from 'react'
import { Page, PageHeader, PageTitle, PageBody, Card, CardHeader, CardTitle, CardContent, Switch, Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@blinkdotnew/ui'
import { Globe, Moon, Sun, Bell, MapPin, Info, ChevronRight, Check } from 'lucide-react'

export default function SettingsPage() {
  const { t, language, setLanguage } = useI18n()
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })
  const [notifications, setNotifications] = useState(true)
  const [locationEnabled, setLocationEnabled] = useState(true)
  
  const isRTL = language === 'ar'

  useEffect(() => {
    // Apply dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <Page>
      <PageHeader>
        <PageTitle>{t.settings.language}</PageTitle>
      </PageHeader>
      <PageBody className="p-4 md:p-6 space-y-6">
        {/* Language Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              {t.settings.language}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                  language === lang.code 
                    ? 'bg-primary/10 border-primary ring-2 ring-primary/20' 
                    : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-left">
                    <div className="font-medium">{lang.native}</div>
                    <div className="text-sm text-muted-foreground">{lang.name}</div>
                  </div>
                </div>
                {language === lang.code && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              {t.settings.theme}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-amber-100'} flex items-center justify-center`}>
                  {darkMode ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6 text-amber-600" />}
                </div>
                <div>
                  <div className="font-medium">
                    {darkMode 
                      ? (language === 'ar' ? 'داكن' : language === 'ru' ? 'Тёмная' : 'Dark')
                      : (language === 'ar' ? 'فاتح' : language === 'ru' ? 'Светлая' : 'Light')
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'تلقائي حسب النظام' : language === 'ru' ? 'Автоматически по системе' : 'Auto based on system'}
                  </div>
                </div>
              </div>
              <Switch 
                checked={darkMode} 
                onCheckedChange={setDarkMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {t.settings.notifications}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>{t.prayer.notifications}</span>
              <Switch 
                checked={notifications} 
                onCheckedChange={setNotifications}
              />
            </div>
            {notifications && (
              <div className="space-y-2 pt-2 border-t">
                <label className="text-sm text-muted-foreground">
                  {t.prayer.notificationBefore}
                </label>
                <Select defaultValue="10">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 {language === 'ar' ? 'دقائق' : language === 'ru' ? 'минут' : 'minutes'}</SelectItem>
                    <SelectItem value="10">10 {language === 'ar' ? 'دقائق' : language === 'ru' ? 'минут' : 'minutes'}</SelectItem>
                    <SelectItem value="15">15 {language === 'ar' ? 'دقائق' : language === 'ru' ? 'минут' : 'minutes'}</SelectItem>
                    <SelectItem value="30">30 {language === 'ar' ? 'دقيقة' : language === 'ru' ? 'минут' : 'minutes'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {t.settings.location}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{t.settings.location}</div>
                <div className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'لتحديد أوقات الصلاة تلقائيًا' : language === 'ru' ? 'Для автоматического определения времени намаза' : 'For automatic prayer times'}
                </div>
              </div>
              <Switch 
                checked={locationEnabled} 
                onCheckedChange={setLocationEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              {t.settings.about}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t.settings.version}</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="pt-4 border-t">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-3">
                  <span className="text-white font-bold text-2xl">م</span>
                </div>
                <h3 className="text-lg font-semibold">Muslim Russia</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === 'ar' ? 'مساعدك اليومي للمسلمين في Russia' : language === 'ru' ? 'Ваш ежедневный помощник для мусульман в России' : 'Your daily assistant for Muslims in Russia'}
                </p>
              </div>
            </div>
            <div className="text-center text-xs text-muted-foreground pt-2">
              {language === 'ar' ? 'صُنع بـ ❤️ للمسلمين' : language === 'ru' ? 'Сделано с ❤️ для мусульман' : 'Made with ❤️ for Muslims'}
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-4 rounded-xl border hover:bg-muted">
            <span>{language === 'ar' ? 'سياسة الخصوصية' : language === 'ru' ? 'Политика конфиденциальности' : 'Privacy Policy'}</span>
            <ChevronRight className={`w-5 h-5 text-muted-foreground ${isRTL ? 'rotate-180' : ''}`} />
          </button>
          <button className="w-full flex items-center justify-between p-4 rounded-xl border hover:bg-muted">
            <span>{language === 'ar' ? 'الشروط والأحكام' : language === 'ru' ? 'Условия использования' : 'Terms of Service'}</span>
            <ChevronRight className={`w-5 h-5 text-muted-foreground ${isRTL ? 'rotate-180' : ''}`} />
          </button>
          <button className="w-full flex items-center justify-between p-4 rounded-xl border hover:bg-muted">
            <span>{language === 'ar' ? 'تواصل معنا' : language === 'ru' ? 'Связаться с нами' : 'Contact Us'}</span>
            <ChevronRight className={`w-5 h-5 text-muted-foreground ${isRTL ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </PageBody>
    </Page>
  )
}