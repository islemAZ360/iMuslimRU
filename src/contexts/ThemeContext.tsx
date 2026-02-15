'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('auto');
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

    const resolveTheme = useCallback((t: Theme): 'light' | 'dark' => {
        if (t === 'auto') return getSystemTheme();
        return t;
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem('imuslim-theme') as Theme | null;
        if (saved) {
            setThemeState(saved);
            setResolvedTheme(resolveTheme(saved));
        } else {
            setResolvedTheme(resolveTheme('auto'));
        }
    }, [resolveTheme]);

    useEffect(() => {
        const resolved = resolveTheme(theme);
        setResolvedTheme(resolved);
        document.documentElement.setAttribute('data-theme', resolved);
    }, [theme, resolveTheme]);

    // Listen for system theme changes (for auto mode)
    useEffect(() => {
        if (theme !== 'auto') return;
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
            const resolved = resolveTheme('auto');
            setResolvedTheme(resolved);
            document.documentElement.setAttribute('data-theme', resolved);
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [theme, resolveTheme]);

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('imuslim-theme', newTheme);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
