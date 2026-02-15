'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { I18nProvider } from '@/contexts/I18nContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { FloatingDock } from '@/components/ui/floating-dock';
import {
    IconHome,
    IconBuildingMosque,
    IconBarcode,
    IconMoon,
    IconChartDonut3,
    IconSettings,
} from '@tabler/icons-react';

function DockNavigation() {
    const pathname = usePathname();

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
                            title: 'Home',
                            icon: <IconHome style={{ width: '100%', height: '100%', color: '#6ee7b7' }} />,
                            href: '/',
                        },
                        {
                            title: 'Prayer',
                            icon: <IconBuildingMosque style={{ width: '100%', height: '100%', color: '#6ee7b7' }} />,
                            href: '/prayer',
                        },
                        {
                            title: 'Scanner',
                            icon: <IconBarcode style={{ width: '100%', height: '100%', color: '#6ee7b7' }} />,
                            href: '/scanner',
                        },
                        {
                            title: 'Believer',
                            icon: <IconMoon style={{ width: '100%', height: '100%', color: '#6ee7b7' }} />,
                            href: '/believer',
                        },
                        {
                            title: 'Stats',
                            icon: <IconChartDonut3 style={{ width: '100%', height: '100%', color: '#6ee7b7' }} />,
                            href: '/stats',
                        },
                        {
                            title: 'Settings',
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
