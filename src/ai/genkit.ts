import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * تهيئة Genkit مع إضافة ملحق Google AI.
 * يتم قراءة مفتاح الـ API تلقائياً من GOOGLE_GENAI_API_KEY في ملف .env
 */
export const ai = genkit({
  plugins: [
    googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY }),
  ],
});
