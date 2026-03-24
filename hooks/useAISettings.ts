import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AIProvider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'mistral'
  | 'groq'
  | 'cohere'
  | 'xai'
  | 'deepseek'
  | 'meta'
  | 'ollama';

export interface AISettings {
  provider: AIProvider;
  model: string;
  apiKey: string;
  baseUrl: string;
}

interface AISettingsState extends AISettings {
  setProvider: (provider: AIProvider) => void;
  setModel: (model: string) => void;
  setApiKey: (apiKey: string) => void;
  setBaseUrl: (baseUrl: string) => void;
  saveSettings: (settings: Partial<AISettings>) => void;
  isConfigured: () => boolean;
  reset: () => void;
}

const DEFAULT_SETTINGS: AISettings = {
  provider: 'openai',
  model: 'gpt-4o-mini',
  apiKey: '',
  baseUrl: '',
};

export const useAISettings = create<AISettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,

      setProvider: (provider) => set({ provider }),
      setModel: (model) => set({ model }),
      setApiKey: (apiKey) => set({ apiKey }),
      setBaseUrl: (baseUrl) => set({ baseUrl }),

      saveSettings: (settings) => set((state) => ({ ...state, ...settings })),

      isConfigured: () => {
        const { apiKey, provider } = get();
        // Ollama is local so no key needed
        if (provider === 'ollama') return true;
        return apiKey.trim().length > 0;
      },

      reset: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'ai-settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ── Provider / model catalogue ──────────────────────────────────────────────

export interface AIModel {
  id: string;
  name: string;
  description?: string;
}

export interface AIProviderInfo {
  id: AIProvider;
  name: string;
  description: string;
  icon: string; // Ionicons name
  gradientColors: [string, string];
  models: AIModel[];
  requiresApiKey: boolean;
  defaultBaseUrl?: string;
  apiKeyPlaceholder?: string;
}

export const AI_PROVIDERS: AIProviderInfo[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4, o1 and more from OpenAI',
    icon: 'sparkles',
    gradientColors: ['#10a37f', '#0d8a6b'],
    requiresApiKey: true,
    apiKeyPlaceholder: 'sk-...',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable multimodal model' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast & affordable' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Powerful with vision' },
      { id: 'gpt-4', name: 'GPT-4', description: 'High intelligence' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and cheap' },
      { id: 'o1-preview', name: 'o1 Preview', description: 'Advanced reasoning' },
      { id: 'o1-mini', name: 'o1 Mini', description: 'Fast reasoning' },
      { id: 'o3-mini', name: 'o3 Mini', description: 'Latest reasoning model' },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    description: 'Claude family – thoughtful and safe AI',
    icon: 'leaf',
    gradientColors: ['#d4651e', '#b8541a'],
    requiresApiKey: true,
    apiKeyPlaceholder: 'sk-ant-...',
    models: [
      { id: 'claude-opus-4-5', name: 'Claude Opus 4.5', description: 'Most powerful Claude' },
      { id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5', description: 'Balanced performance' },
      { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', description: 'Extended thinking' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Fast and efficient' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Top-tier intelligence' },
    ],
  },
  {
    id: 'google',
    name: 'Google (Gemini)',
    description: 'Gemini models from Google DeepMind',
    icon: 'logo-google',
    gradientColors: ['#4285F4', '#1a73e8'],
    requiresApiKey: true,
    apiKeyPlaceholder: 'AIza...',
    models: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Fastest Gemini' },
      { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', description: 'Ultra lightweight' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Long context window' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Speed optimised' },
      { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', description: 'Reliable baseline' },
    ],
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Open and efficient European AI',
    icon: 'wind',
    gradientColors: ['#FF7000', '#cc5900'],
    requiresApiKey: true,
    apiKeyPlaceholder: 'mis-...',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large', description: 'Top flagship model' },
      { id: 'mistral-medium-latest', name: 'Mistral Medium', description: 'Balanced capability' },
      { id: 'mistral-small-latest', name: 'Mistral Small', description: 'Lightweight & fast' },
      { id: 'open-mistral-7b', name: 'Open Mistral 7B', description: 'Open-source 7B' },
      { id: 'open-mixtral-8x7b', name: 'Open Mixtral 8×7B', description: 'MoE powerhouse' },
      { id: 'codestral-latest', name: 'Codestral', description: 'Code specialist' },
    ],
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast LPU inference engine',
    icon: 'flash',
    gradientColors: ['#F55036', '#c93d2b'],
    requiresApiKey: true,
    apiKeyPlaceholder: 'gsk_...',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'LLaMA 3.3 70B', description: 'Latest versatile Llama' },
      { id: 'llama-3.1-70b-versatile', name: 'LLaMA 3.1 70B', description: 'Strong open model' },
      { id: 'llama-3.1-8b-instant', name: 'LLaMA 3.1 8B Instant', description: 'Lightning fast' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8×7B 32K', description: 'Long context MoE' },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B', description: 'Google open model' },
      { id: 'gemma-7b-it', name: 'Gemma 7B', description: 'Efficient Google model' },
    ],
  },
  {
    id: 'cohere',
    name: 'Cohere',
    description: 'Enterprise-grade NLP models',
    icon: 'layers',
    gradientColors: ['#39594D', '#2a4238'],
    requiresApiKey: true,
    apiKeyPlaceholder: 'co-...',
    models: [
      { id: 'command-r-plus', name: 'Command R+', description: 'Most capable Command' },
      { id: 'command-r', name: 'Command R', description: 'RAG-optimised model' },
      { id: 'command', name: 'Command', description: 'Reliable instruction-following' },
      { id: 'command-light', name: 'Command Light', description: 'Compact & fast' },
    ],
  },
  {
    id: 'xai',
    name: 'xAI (Grok)',
    description: 'Grok models by xAI with real-time data',
    icon: 'planet',
    gradientColors: ['#000000', '#1a1a1a'],
    requiresApiKey: true,
    apiKeyPlaceholder: 'xai-...',
    models: [
      { id: 'grok-2', name: 'Grok 2', description: 'Latest flagship Grok' },
      { id: 'grok-2-mini', name: 'Grok 2 Mini', description: 'Faster Grok 2' },
      { id: 'grok-beta', name: 'Grok Beta', description: 'Experimental release' },
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'Powerful Chinese open-source models',
    icon: 'search',
    gradientColors: ['#4D6BFE', '#3a57e8'],
    requiresApiKey: true,
    apiKeyPlaceholder: 'sk-...',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat', description: 'General conversation' },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', description: 'Advanced reasoning' },
      { id: 'deepseek-coder', name: 'DeepSeek Coder', description: 'Code specialist' },
    ],
  },
  {
    id: 'meta',
    name: 'Meta (Llama)',
    description: 'LLaMA models via Together.ai / Replicate',
    icon: 'logo-facebook',
    gradientColors: ['#0082FB', '#0068d4'],
    requiresApiKey: true,
    apiKeyPlaceholder: 'together-...',
    models: [
      { id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', name: 'LLaMA 3.3 70B Turbo', description: 'Fastest Llama 3.3' },
      { id: 'meta-llama/Llama-3.1-405B-Instruct-Turbo', name: 'LLaMA 3.1 405B Turbo', description: 'Largest open model' },
      { id: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo', name: 'LLaMA 3.1 8B Turbo', description: 'Tiny & fast' },
    ],
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    description: 'Run models locally on your device',
    icon: 'hardware-chip',
    gradientColors: ['#7C3AED', '#6d28d9'],
    requiresApiKey: false,
    defaultBaseUrl: 'http://localhost:11434',
    apiKeyPlaceholder: 'No key needed',
    models: [
      { id: 'llama3.2', name: 'LLaMA 3.2', description: 'Meta\'s latest local model' },
      { id: 'llama3.1', name: 'LLaMA 3.1', description: 'Versatile open model' },
      { id: 'mistral', name: 'Mistral', description: 'Fast European model' },
      { id: 'codellama', name: 'Code Llama', description: 'Code generation' },
      { id: 'phi3', name: 'Phi-3', description: 'Microsoft small model' },
      { id: 'qwen2.5', name: 'Qwen 2.5', description: 'Alibaba multilingual' },
    ],
  },
];

export function getProviderInfo(id: AIProvider): AIProviderInfo | undefined {
  return AI_PROVIDERS.find((p) => p.id === id);
}
