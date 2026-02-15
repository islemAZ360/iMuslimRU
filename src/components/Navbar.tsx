'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { FloatingDock } from '@/components/ui/floating-dock';
import {
    IconHome,
    IconScan, // Using generic names, will map to tabler icons
    IconHeartRateMonitor,
    IconSettings,
    IconBuildingMosque, // For prayer
} from '@tabler/icons-react';

export default function Navbar() {
    const pathname = usePathname();
    const { t } = useI18n();

    // Don't show navbar on login page
    if (pathname === '/login' || pathname === '/register') return null;

    // Map content to Floating Dock format
    const links = [
        {
            title: t('nav.home') || 'Home',
            icon: (
                <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
            ),
            href: '/',
        },
        {
            title: t('nav.prayer') || 'Prayer',
            icon: (
                <IconBuildingMosque className="h-full w-full text-neutral-500 dark:text-neutral-300" />
            ),
            href: '/prayer',
        },
        {
            title: t('nav.scanner') || 'Scanner',
            icon: (
                <IconScan className="h-full w-full text-neutral-500 dark:text-neutral-300" />
            ),
            href: '/scanner',
        },
        {
            title: t('nav.health') || 'Health',
            icon: (
                <IconHeartRateMonitor className="h-full w-full text-neutral-500 dark:text-neutral-300" />
            ),
            href: '/health',
        },
        {
            title: t('nav.settings') || 'Settings',
            icon: (
                <IconSettings className="h-full w-full text-neutral-500 dark:text-neutral-300" />
            ),
            href: '/settings',
        },
    ];

    // FloatingDock expects to be in a container usually, but here it acts as fixed nav
    // We need to position it at the bottom.
    return (
        <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center">
            <FloatingDock
                items={links}
                // Adjust mobile class to ensure it's visible and accessible
                mobileClassName=""
            />
        </div>
    );
}
