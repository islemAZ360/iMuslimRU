'use client';

import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { I18nProvider } from '@/contexts/I18nContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import Navbar from '@/components/Navbar';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <I18nProvider>
                <SettingsProvider>
                    <AuthProvider>
                        {children}
                        <Navbar />
                    </AuthProvider>
                </SettingsProvider>
            </I18nProvider>
        </ThemeProvider>
    );
}
