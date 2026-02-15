'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface SettingsContextType {
    geminiApiKey: string;
    setGeminiApiKey: (key: string) => void;
    hasGeminiKey: boolean;
    geminiModel: string;
    setGeminiModel: (model: string) => void;
}

const DEFAULT_MODEL = 'gemini-3-flash-preview';

const AVAILABLE_MODELS = [
    'gemini-3-flash-preview',
    'gemini-2.5-flash-preview-05-20',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
];

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [geminiApiKey, setKeyState] = useState('');
    const [geminiModel, setModelState] = useState(DEFAULT_MODEL);

    useEffect(() => {
        const savedKey = localStorage.getItem('imuslim-gemini-key');
        const savedModel = localStorage.getItem('imuslim-gemini-model');
        if (savedKey) setKeyState(savedKey);
        if (savedModel) setModelState(savedModel);
    }, []);

    const setGeminiApiKey = useCallback((key: string) => {
        setKeyState(key);
        localStorage.setItem('imuslim-gemini-key', key);
    }, []);

    const setGeminiModel = useCallback((model: string) => {
        setModelState(model);
        localStorage.setItem('imuslim-gemini-model', model);
    }, []);

    return (
        <SettingsContext.Provider
            value={{
                geminiApiKey,
                setGeminiApiKey,
                hasGeminiKey: !!geminiApiKey,
                geminiModel,
                setGeminiModel,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export { AVAILABLE_MODELS };

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within a SettingsProvider');
    return context;
}
