'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { I18nProvider } from '@/contexts/I18nContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { useI18n } from '@/contexts/I18nContext';
import { FloatingDock } from '@/components/ui/floating-dock';
import {
    IconHome,
    IconBuildingMosque,
    IconScan,
    IconMoon,
    IconChartDonut3,
    IconSettings,
    IconMoonStars,
    IconHeartRateMonitor,
} from '@tabler/icons-react';

function DockNavigation() {
    const pathname = usePathname();
    const { t } = useI18n();

    // Hide dock on login/register pages
    if (pathname === '/login' || pathname === '/register') return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '16px',
                left: 0,
                right: 0,
                zIndex: 9999,
                display: 'flex',
                justifyContent: 'center',
                pointerEvents: 'none',
            }}
        >
            <div style={{ pointerEvents: 'auto' }}>
                <FloatingDock
                    items={[
                        {
                            title: t('nav.home') || 'Home',
                            icon: <IconHome style={{ width: '100%', height: '100%', color: '#6ee7b7' }} />,
                            href: '/',
                        },
                        {
                            title: t('nav.prayer') || 'Prayer',
                            icon: <IconBuildingMosque style={{ width: '100%', height: '100%', color: '#6ee7b7' }} />,
                            href: '/prayer',
                        },
                        {
                            title: t('nav.ramadan') || 'Ramadan',
                            icon: <IconMoonStars style={{ width: '100%', height: '100%', color: '#6ee7b7' }} />,
                            href: '/ramadan',
                        },
                        {
                            title: t('nav.scanner') || 'Scanner',
                            icon: <IconScan style={{ width: '100%', height: '100%', color: '#6ee7b7' }} />,
                            href: '/scanner',
                        },
                        {
                            title: t('nav.believer') || 'Believer',
                            icon: <IconMoon style={{ width: '100%', height: '100%', color: '#6ee7b7' }} />,
                            href: '/believer',
                        },
                        {
                            title: t('nav.health') || 'Health',
                            icon: <IconHeartRateMonitor style={{ width: '100%', height: '100%', color: '#6ee7b7' }} />,
                            href: '/health',
                        },
                        {
                            title: t('nav.settings') || 'Settings',
                            icon: <IconSettings style={{ width: '100%', height: '100%', color: '#6ee7b7' }} />,
                            href: '/settings',
                        },
                    ]}
                />
            </div>
        </div>
    );
}

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <I18nProvider>
                <SettingsProvider>
                    <AuthProvider>
                        {children}
                        <DockNavigation />
                    </AuthProvider>
                </SettingsProvider>
            </I18nProvider>
        </ThemeProvider>
    );
}
