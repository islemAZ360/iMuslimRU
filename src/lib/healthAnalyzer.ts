import { analyzeWithGemini } from '@/lib/gemini';
import { HealthProfile } from '@/contexts/AuthContext';

export interface HealthAnalysisResult {
    analysis: string;
    error?: string;
}

export async function analyzeHealth(
    apiKey: string,
    productInfo: string,
    healthProfile: HealthProfile,
    imageBase64?: string,
    locale: string = 'ru',
    modelName?: string
): Promise<HealthAnalysisResult> {
    const langMap: Record<string, string> = {
        ru: 'Russian',
        en: 'English',
        ar: 'Arabic',
    };
    const language = langMap[locale] || 'Russian';

    const age = healthProfile.dateOfBirth
        ? Math.floor(
            (Date.now() - new Date(healthProfile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
        )
        : 'unknown';

    const prompt = `You are a professional nutritionist AI assistant. Analyze this food/product for a specific person and provide personalized health advice.

**User Health Profile:**
- Name: ${healthProfile.name || 'User'}
- Age: ${age} years
- Height: ${healthProfile.height || 'unknown'} cm
- Weight: ${healthProfile.weight || 'unknown'} kg
- BMI: ${healthProfile.height && healthProfile.weight ? (healthProfile.weight / Math.pow(healthProfile.height / 100, 2)).toFixed(1) : 'unknown'}
- Chronic Diseases: ${healthProfile.chronicDiseases?.length ? healthProfile.chronicDiseases.join(', ') : 'None reported'}
- Allergies: ${healthProfile.allergies?.length ? healthProfile.allergies.join(', ') : 'None reported'}

**Product/Food Information:**
${productInfo}

**Please provide in ${language} language:**

1. 📊 **Nutritional Analysis**: Estimate calories, sugar, fat, protein, sodium content.

2. ⚠️ **Allergy Alert**: Check if ANY ingredients match the user's allergies. This is CRITICAL - be thorough.

3. 🏥 **Disease Considerations**: Based on the user's chronic diseases, provide specific warnings:
   - For diabetes: sugar and carb content warnings
   - For hypertension: sodium content warnings
   - For heart disease: saturated fat and cholesterol warnings
   - For kidney disease: protein and potassium warnings
   - For any other listed condition: relevant nutritional warnings

4. 💚 **Personalized Recommendation**: A clear verdict:
   - ✅ "Healthy for you" — safe and recommended
   - ⚠️ "Use with caution" — limited consumption advised, explain why
   - ❌ "Not recommended" — potentially harmful, explain why

5. 💡 **Tip**: One actionable health tip related to this product/food.

Be specific, accurate, and compassionate. Address the user by name.`;

    try {
        const analysis = await analyzeWithGemini(
            apiKey,
            prompt,
            imageBase64,
            imageBase64 ? 'image/jpeg' : undefined,
            modelName
        );
        return { analysis };
    } catch (error: any) {
        return {
            analysis: '',
            error: error.message || 'Health analysis failed',
        };
    }
}
