import { analyzeWithGemini } from '@/lib/gemini';

export interface Product {
    barcode: string;
    name: string;
    nameEn: string;
    manufacturer: string;
    ingredients: string[];
    halalStatus: 'halal' | 'haram' | 'doubtful';
    haramIngredients: string[];
    boycottStatus: boolean;
    boycottReason: string;
}

export interface ScanResult {
    product: Product | null;
    source: 'database' | 'ai';
    aiAnalysis?: string;
}

// ===== COMPREHENSIVE HARAM INGREDIENTS DATABASE =====
// Organized by category for maintainability

const HARAM_EXACT: Set<string> = new Set([
    // --- Alcohol ---
    'alcohol', 'ethanol', 'ethyl alcohol', 'алкоголь', 'спирт', 'этанол',
    'wine', 'beer', 'rum', 'brandy', 'vodka', 'whiskey', 'вино', 'пиво',
    'rum extract', 'wine vinegar',
    // --- Pork ---
    'pork', 'lard', 'bacon', 'ham', 'свинина', 'свиной', 'сало',
    'pork gelatin', 'pork fat', 'свиной жир', 'свиной желатин',
    'pig', 'рогатый скот',
    // --- Specific substances ---
    'carmine', 'cochineal', 'кармин', 'кошениль',
    'shellac', 'шеллак',
    'l-cysteine', 'л-цистеин',
    'rennet', 'animal rennet', 'сычужный фермент',
    'pepsin', 'пепсин',
]);

// E-numbers that are ALWAYS haram (animal-derived only)
const HARAM_ENUMBERS: Set<string> = new Set([
    'e120',  // Carmine/Cochineal
    'e441',  // Gelatin
    'e542',  // Bone phosphate
    'e904',  // Shellac
    'e910',  // L-Cysteine (from hair/feathers)
    'e921',  // L-Cysteine (same)
]);

// E-numbers that are DOUBTFUL (can be animal or plant-derived)
const DOUBTFUL_ENUMBERS: Set<string> = new Set([
    'e470', 'e470a', 'e470b',  // Fatty acid salts
    'e471', 'e472', 'e472a', 'e472b', 'e472c', 'e472d', 'e472e', 'e472f',
    'e473', 'e474', 'e475', 'e476', 'e477', 'e478',
    'e481', 'e482', 'e483',
    'e491', 'e492', 'e493', 'e494', 'e495',
    'e570', 'e572',  // Stearic acid and salts
    'e631', 'e635',  // Inosinic acid (can be from fish)
    'e322',  // Lecithin (usually plant, sometimes animal)
    'e422',  // Glycerol/Glycerin (can be animal fat)
    'e432', 'e433', 'e434', 'e435', 'e436', // Polysorbates
]);

// Substring patterns for partial matching
const HARAM_SUBSTRINGS: string[] = [
    'pork', 'свин', 'lard', 'сало',
    'gelatin', 'желатин',
    'кармин', 'carmine',
    'cochineal', 'кошениль',
    'shellac', 'шеллак',
    'animal fat', 'животный жир',
    'beef tallow', 'говяжий жир',
];

let productsDB: Product[] | null = null;

async function loadProductsDB(): Promise<Product[]> {
    if (productsDB) return productsDB;
    try {
        const response = await fetch('/data/products.json');
        if (!response.ok) return [];
        productsDB = await response.json();
        return productsDB!;
    } catch {
        return [];
    }
}

export async function classicScan(barcode: string): Promise<ScanResult> {
    const db = await loadProductsDB();
    const product = db.find((p) => p.barcode === barcode) || null;
    return { product, source: 'database' };
}

/**
 * Smart haram-check with 3-tier matching:
 * 1. Exact match against HARAM_EXACT set (fast)
 * 2. E-number extraction + check against HARAM/DOUBTFUL sets
 * 3. Substring match for partial ingredient names
 */
export function checkHaramIngredients(ingredients: string[]): {
    haram: string[];
    doubtful: string[];
} {
    const haram: string[] = [];
    const doubtful: string[] = [];

    for (const ingredient of ingredients) {
        const lower = ingredient.toLowerCase().trim();

        // 1. Exact match
        if (HARAM_EXACT.has(lower)) {
            haram.push(ingredient);
            continue;
        }

        // 2. Extract E-numbers (e.g., E471, E120)
        const eMatches = lower.match(/e\d{3}[a-z]?/gi);
        if (eMatches) {
            for (const e of eMatches) {
                const normalized = e.toLowerCase();
                if (HARAM_ENUMBERS.has(normalized)) {
                    haram.push(`${ingredient} (${e.toUpperCase()})`);
                } else if (DOUBTFUL_ENUMBERS.has(normalized)) {
                    doubtful.push(`${ingredient} (${e.toUpperCase()})`);
                }
            }
            continue;
        }

        // 3. Substring match
        for (const pattern of HARAM_SUBSTRINGS) {
            if (lower.includes(pattern)) {
                haram.push(ingredient);
                break;
            }
        }
    }

    return { haram, doubtful };
}

export async function aiScan(
    apiKey: string,
    barcode: string,
    imageBase64?: string,
    locale: string = 'ru',
    modelName?: string
): Promise<ScanResult> {
    const langMap: Record<string, string> = {
        ru: 'Russian',
        en: 'English',
        ar: 'Arabic',
    };
    const language = langMap[locale] || 'Russian';

    // Try local DB first
    const db = await loadProductsDB();
    const localProduct = db.find((p) => p.barcode === barcode) || null;

    // If local product found, do smart local check too
    let localCheck = '';
    if (localProduct && localProduct.ingredients.length > 0) {
        const result = checkHaramIngredients(localProduct.ingredients);
        if (result.haram.length > 0) {
            localCheck = `\n\nLocal database flagged these HARAM ingredients: ${result.haram.join(', ')}`;
        }
        if (result.doubtful.length > 0) {
            localCheck += `\nLocal database flagged these DOUBTFUL ingredients: ${result.doubtful.join(', ')}`;
        }
    }

    const prompt = `You are an expert Islamic food analyst. Analyze this product for Muslim consumers in Russia.

${barcode ? `Barcode: ${barcode}` : ''}
${localProduct ? `Known product: ${localProduct.name}, Manufacturer: ${localProduct.manufacturer}, Ingredients: ${localProduct.ingredients.join(', ')}` : ''}
${localCheck}

Provide a detailed analysis in ${language} language covering:

1. **Halal Status**: Is this product halal, haram, or doubtful? Explain WHY in detail.
   - List each suspicious ingredient and explain its origin (animal/plant).
   - For E-numbers, explain what they are and whether they are typically animal-derived.

2. **Boycott Status**: Check if the manufacturer or parent company is on boycott lists related to Israel.
   - If boycotted, explain the specific connection.
   - If not boycotted, clearly state this.

3. **Final Verdict**: Clear recommendation.

Be accurate and detailed. If unsure about an ingredient, say "doubtful" and explain why rather than guessing.`;

    try {
        const aiAnalysis = await analyzeWithGemini(apiKey, prompt, imageBase64, imageBase64 ? 'image/jpeg' : undefined, modelName);
        return {
            product: localProduct,
            source: 'ai',
            aiAnalysis,
        };
    } catch (error) {
        return {
            product: localProduct,
            source: 'database',
            aiAnalysis: 'AI analysis failed. Showing database results.',
        };
    }
}
