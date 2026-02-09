
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * تهيئة Genkit مع إضافة ملحق Google AI.
 * يستخدم النظام تلقائياً مفتاح GOOGLE_GENAI_API_KEY من ملف .env
 */
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});
