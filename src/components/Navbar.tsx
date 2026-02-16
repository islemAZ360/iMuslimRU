'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import {
    IconHome,
    IconScan,
    IconHeartRateMonitor,
    IconSettings,
    IconBuildingMosque,
    IconMoonStars,
    IconLayoutGrid, // For Believer page if added
} from '@tabler/icons-react';
import styles from './Navbar.module.css';

export default function Navbar() {
    const pathname = usePathname();
    const { t } = useI18n();

    // Don't show navbar on login page
    if (pathname === '/login' || pathname === '/register') return null;

    const links = [
        {
            title: t('nav.home') || 'Home',
            icon: <IconHome size={22} />,
            href: '/',
        },
        {
            title: t('nav.prayer') || 'Prayer',
            icon: <IconBuildingMosque size={22} />,
            href: '/prayer',
        },
        {
            title: t('nav.ramadan') || 'Ramadan',
            icon: <IconMoonStars size={22} />,
            href: '/ramadan',
        },
        {
            title: t('nav.believer') || 'Believer',
            icon: <IconLayoutGrid size={22} />, // Using LayoutGrid for "Believer" dashboard feel
            href: '/believer',
        },
        {
            title: t('nav.scanner') || 'Scanner',
            icon: <IconScan size={22} />,
            href: '/scanner',
        },
        {
            title: t('nav.health') || 'Health',
            icon: <IconHeartRateMonitor size={22} />,
            href: '/health',
        },
        // Settings moved to top right usually, but if needed in dock:
        {
            title: t('nav.settings') || 'Settings',
            icon: <IconSettings size={22} />,
            href: '/settings',
        },
    ];

    return (
        <nav className={styles.navbar}>
            {links.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                    >
                        <div className={styles.iconWrapper}>
                            {item.icon}
                        </div>
                        <span className={styles.activeDot} />
                        <span className={styles.tooltip}>{item.title}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
