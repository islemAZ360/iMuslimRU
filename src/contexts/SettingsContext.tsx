'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';


interface SettingsContextType {
    geminiApiKey: string;
    setGeminiApiKey: (key: string) => void;
    hasGeminiKey: boolean;
    geminiModel: string;
    setGeminiModel: (model: string) => void;
    isFastingMode: boolean;
    setIsFastingMode: (isFasting: boolean) => void;
}

const DEFAULT_MODEL = 'gemini-3-flash-preview';

const AVAILABLE_MODELS = [
    'gemini-3-flash-preview',
];

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [geminiApiKey, setKeyState] = useState('');
    const [geminiModel, setModelState] = useState(DEFAULT_MODEL);
    const [isFastingMode, setFastingState] = useState(false);

    useEffect(() => {
        const savedKey = localStorage.getItem('imuslim-gemini-key');
        const savedModel = localStorage.getItem('imuslim-gemini-model');
        const savedFasting = localStorage.getItem('imuslim-fasting-mode');
        
        if (savedKey) setKeyState(savedKey);
        if (savedModel) setModelState(savedModel);
        if (savedFasting) setFastingState(savedFasting === 'true');
    }, []);

    const setGeminiApiKey = useCallback((key: string) => {
        setKeyState(key);
        localStorage.setItem('imuslim-gemini-key', key);
    }, []);

    const setGeminiModel = useCallback((model: string) => {
        setModelState(model);
        localStorage.setItem('imuslim-gemini-model', model);
    }, []);

    const setIsFastingMode = useCallback((isFasting: boolean) => {
        setFastingState(isFasting);
        localStorage.setItem('imuslim-fasting-mode', isFasting.toString());
    }, []);

    return (
        <SettingsContext.Provider
            value={{
                geminiApiKey,
                setGeminiApiKey,
                hasGeminiKey: !!geminiApiKey,
                geminiModel,
                setGeminiModel,
                isFastingMode,
                setIsFastingMode,
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

