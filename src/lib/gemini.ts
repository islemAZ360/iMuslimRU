import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;
let currentApiKey: string = '';

// Default model — can be changed in settings
const DEFAULT_MODEL = 'gemini-3-flash-preview';

export function getGeminiClient(apiKey?: string): GoogleGenerativeAI | null {
    const key = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!key) return null;

    if (!genAI || currentApiKey !== key) {
        genAI = new GoogleGenerativeAI(key);
        currentApiKey = key;
    }
    return genAI;
}

export function resetGeminiClient() {
    genAI = null;
    currentApiKey = '';
}

export async function analyzeWithGemini(
    apiKey: string,
    prompt: string,
    imageBase64?: string,
    mimeType?: string,
    modelName?: string
): Promise<string> {
    const client = getGeminiClient(apiKey);
    if (!client) throw new Error('Gemini API key not configured');

    const model = client.getGenerativeModel({ model: modelName || DEFAULT_MODEL });

    const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [
        { text: prompt },
    ];

    if (imageBase64 && mimeType) {
        parts.push({
            inlineData: {
                data: imageBase64,
                mimeType,
            },
        });
    }

    const result = await model.generateContent(parts);
    const response = result.response;
    return response.text();
}
