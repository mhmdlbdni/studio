import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * تهيئة Genkit مع إضافة ملحق Google AI.
 * سيبحث النظام تلقائياً عن مفتاح GOOGLE_GENAI_API_KEY في ملف .env
 */
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});
