'use client';

import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { I18nProvider } from '@/contexts/I18nContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { FloatingDock } from '@/components/ui/floating-dock';
import { IconHome, IconBuildingMosque, IconBarcode, IconHeartbeat, IconSettings, IconPray } from '@tabler/icons-react';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <I18nProvider>
                <SettingsProvider>
                    <AuthProvider>
                        {children}
                        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
                            <div className="pointer-events-auto">
                                <FloatingDock
                                    items={[
                                        { title: 'Home', icon: <IconHome className="w-full h-full text-neutral-500 dark:text-neutral-300" />, href: '/' },
                                        { title: 'Prayer', icon: <IconBuildingMosque className="w-full h-full text-neutral-500 dark:text-neutral-300" />, href: '/prayer' },
                                        { title: 'Scanner', icon: <IconBarcode className="w-full h-full text-neutral-500 dark:text-neutral-300" />, href: '/scanner' },
                                        { title: 'Believer', icon: <IconPray className="w-full h-full text-neutral-500 dark:text-neutral-300" />, href: '/believer' },
                                        { title: 'Health', icon: <IconHeartbeat className="w-full h-full text-neutral-500 dark:text-neutral-300" />, href: '/health' },
                                        { title: 'Settings', icon: <IconSettings className="w-full h-full text-neutral-500 dark:text-neutral-300" />, href: '/settings' },
                                    ]}
                                    desktopClassName="dark:bg-black/50 backdrop-blur-md border-neutral-800"
                                    mobileClassName="translate-y-0"
                                />
                            </div>
                        </div>
                    </AuthProvider>
                </SettingsProvider>
            </I18nProvider>
        </ThemeProvider>
    );
}
