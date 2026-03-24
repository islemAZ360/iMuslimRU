// ═══════════════════════════════════════════════════════════════════════════
// App Configuration and Routing - Muslim Russia
// ═══════════════════════════════════════════════════════════════════════════

import { createRouter, createRootRoute, Outlet, RouterProvider, Link } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useI18n } from './lib/i18n'
import { useState, useEffect, Suspense, lazy } from 'react'
import { 
  AppShell, AppShellSidebar, AppShellMain, 
  Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarItem,
  MobileSidebarTrigger, Page, PageHeader, PageTitle, PageBody
} from '@blinkdotnew/ui'
import { 
  Home, Clock, BookOpen, Compass, Camera, 
  Moon, Calendar, BarChart3, Settings,
  Globe, Menu, X
} from 'lucide-react'
import './index.css'

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'))
const PrayerTimesPage = lazy(() => import('./pages/PrayerTimesPage'))
const AzkarPage = lazy(() => import('./pages/AzkarPage'))
const QiblaPage = lazy(() => import('./pages/QiblaPage'))
const HalalPage = lazy(() => import('./pages/HalalPage'))
const RamadanPage = lazy(() => import('./pages/RamadanPage'))
const EventsPage = lazy(() => import('./pages/EventsPage'))
const StatsPage = lazy(() => import('./pages/StatsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

// Loading component
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
    </div>
  )
}

// Root route
function Root() {
  return <Outlet />
}

// Layout component with sidebar
function Layout() {
  const { t, language, setLanguage } = useI18n()
  const [mobileOpen, setMobileOpen] = useState(false)
  
  const navItems = [
    { icon: Home, label: t.nav.home, href: '/' },
    { icon: Clock, label: t.nav.prayerTimes, href: '/prayer-times' },
    { icon: BookOpen, label: t.nav.azkar, href: '/azkar' },
    { icon: Compass, label: t.nav.qibla, href: '/qibla' },
    { icon: Camera, label: t.nav.halal, href: '/halal' },
    { icon: Moon, label: t.nav.ramadan, href: '/ramadan' },
    { icon: Calendar, label: t.nav.events, href: '/events' },
    { icon: BarChart3, label: t.nav.stats, href: '/stats' },
    { icon: Settings, label: t.nav.settings, href: '/settings' },
  ]

  const isRTL = language === 'ar'

  return (
    <AppShell>
      <AppShellSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Sidebar>
          <SidebarHeader className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-lg">م</span>
              </div>
              <div>
                <h2 className="font-semibold text-sm">Muslim Russia</h2>
                <p className="text-xs text-muted-foreground">Мусульманин России</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>{language === 'ar' ? 'القائمة' : language === 'ru' ? 'Меню' : 'Menu'}</SidebarGroupLabel>
              {navItems.map((item) => (
                <SidebarItem
                  key={item.href}
                  icon={<item.icon className="w-5 h-5" />}
                  label={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </AppShellSidebar>
      
      <AppShellMain>
        {/* Mobile Header */}
        <div className={`md:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-card ${isRTL ? 'flex-row-reverse' : ''}`}>
          <MobileSidebarTrigger onClick={() => setMobileOpen(true)} />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold">م</span>
            </div>
            <span className="font-semibold text-sm">Muslim Russia</span>
          </div>
          <button 
            onClick={() => {
              const next = language === 'ar' ? 'ru' : language === 'ru' ? 'en' : 'ar'
              setLanguage(next)
            }}
            className="p-2 rounded-lg hover:bg-muted"
          >
            <Globe className="w-5 h-5" />
          </button>
        </div>
        
        {/* Page Content */}
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </AppShellMain>
    </AppShell>
  )
}

// Create routes
const rootRoute = createRootRoute({
  component: Layout,
})

const indexRoute = createRootRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const prayerTimesRoute = createRootRoute({
  getParentRoute: () => rootRoute,
  path: '/prayer-times',
  component: PrayerTimesPage,
})

const azkarRoute = createRootRoute({
  getParentRoute: () => rootRoute,
  path: '/azkar',
  component: AzkarPage,
})

const qiblaRoute = createRootRoute({
  getParentRoute: () => rootRoute,
  path: '/qibla',
  component: QiblaPage,
})

const halalRoute = createRootRoute({
  getParentRoute: () => rootRoute,
  path: '/halal',
  component: HalalPage,
})

const ramadanRoute = createRootRoute({
  getParentRoute: () => rootRoute,
  path: '/ramadan',
  component: RamadanPage,
})

const eventsRoute = createRootRoute({
  getParentRoute: () => rootRoute,
  path: '/events',
  component: EventsPage,
})

const statsRoute = createRootRoute({
  getParentRoute: () => rootRoute,
  path: '/stats',
  component: StatsPage,
})

const settingsRoute = createRootRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  prayerTimesRoute,
  azkarRoute,
  qiblaRoute,
  halalRoute,
  ramadanRoute,
  eventsRoute,
  statsRoute,
  settingsRoute,
])

const router = createRouter({ routeTree })

// Declare types for TanStack Router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Main App Component
export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <TanStackRouterDevtools router={router} initialIsOpen={false} />
    </>
  )
}