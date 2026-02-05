'use server';
/**
 * @fileOverview مرشد مالي ذكي يعتمد على Genkit لتحليل البيانات المالية للمستخدم.
 *
 * - getFinancialAdvice - الوظيفة الرئيسية التي تستقبل استعلام المستخدم وبياناته المالية.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// تعريف هيكل البيانات المدخلة للمرشد
const FinancialAdviceInputSchema = z.object({
  query: z.string().describe('استعلام المستخدم المالي.'),
  history: z.array(z.object({
    sender: z.string(),
    text: z.string(),
  })).optional().describe('سجل المحادثة للحفاظ على السياق.'),
  financials: z.object({
    totalIncome: z.number().describe("إجمالي الدخل."),
    totalExpenses: z.number().describe("إجمالي المصاريف."),
    pots: z.array(z.object({
        id: z.string().describe("معرف الوعاء."),
        name: z.string().describe("اسم الوعاء."),
        percentage: z.number().describe("النسبة المخصصة."),
        balance: z.number().describe("الرصيد الحالي."),
    })).describe("قائمة الموازين المالية للمستخدم."),
    transactions: z.array(z.object({
        id: z.string(),
        type: z.enum(['income', 'expense']),
        description: z.string(),
        amount: z.number(),
        date: z.string(),
        potId: z.string().optional(),
    })).optional().describe("قائمة المعاملات الأخيرة للتحليل.")
  }),
});

export type FinancialAdviceInput = z.infer<typeof FinancialAdviceInputSchema>;

// تعريف الأدوات (Tools) التي يمكن للذكاء الاصطناعي استخدامها
const addIncomeTool = ai.defineTool({
    name: 'addIncome',
    description: 'تسجيل دخل جديد للمستخدم (مثل راتب أو مكافأة).',
    inputSchema: z.object({
        description: z.string().describe('وصف الدخل.'),
        amount: z.number().describe('المبلغ.'),
    }),
    outputSchema: z.string(),
}, async () => "تم طلب إضافة الدخل.");

const addExpenseTool = ai.defineTool({
    name: 'addExpense',
    description: 'تسجيل مصروف جديد والخصم من وعاء محدد.',
    inputSchema: z.object({
        description: z.string().describe('وصف المصروف.'),
        amount: z.number().describe('المبلغ.'),
        potId: z.string().describe('معرف الوعاء المطلوب الخصم منه.'),
    }),
    outputSchema: z.string(),
}, async () => "تم طلب إضافة المصروف.");

const navigateToTool = ai.defineTool({
    name: 'navigateTo',
    description: 'مساعدة المستخدم في الانتقال لصفحات الإعدادات أو إدارة الأوعية.',
    inputSchema: z.object({
        page: z.enum(['manage-pots', 'settings']).describe('الصفحة الهدف.'),
    }),
    outputSchema: z.string(),
}, async () => "تم طلب التنقل.");

// تعريف المطالبة (Prompt) الخاصة بالمرشد
const financialAdvicePrompt = ai.definePrompt({
    name: 'financialAdvicePrompt',
    input: { schema: FinancialAdviceInputSchema },
    model: 'googleai/gemini-1.5-flash',
    tools: [addIncomeTool, addExpenseTool, navigateToTool],
    prompt: `أنت "مرشد الموازين"، خبير مالي ذكي. مهمتك هي تحليل البيانات المالية للمستخدم وتقديم نصائح عملية.

**البيانات المالية الحالية:**
*   الدخل الإجمالي: {{financials.totalIncome}}
*   المصاريف الإجمالية: {{financials.totalExpenses}}
*   الموازين (الأوعية):
    {{#each financials.pots}}
    - {{name}}: الرصيد {{balance}} ({{percentage}}%)
    {{/each}}

**المعاملات الأخيرة:**
{{#if financials.transactions}}
{{#each financials.transactions}}
* {{type}}: {{description}} - {{amount}} بتاريخ {{date}}
{{/each}}
{{else}}
لا توجد معاملات مسجلة.
{{/if}}

استخدم الأدوات المتاحة إذا طلب المستخدم تسجيل عملية مالية. كن ودوداً، مختصراً، ومحفزاً باللغة العربية.

سؤال المستخدم: {{{query}}}`,
});

/**
 * تنفيذ تدفق المرشد المالي.
 */
export async function getFinancialAdvice(input: FinancialAdviceInput) {
    try {
        const response = await financialAdvicePrompt(input);
        return {
            text: response.text,
            toolRequests: response.toolRequests,
        };
    } catch (e) {
        console.error("AI Flow Error:", e);
        return {
            text: "عذراً، واجهت مشكلة في معالجة طلبك حالياً. يرجى التأكد من إضافة مفتاح GOOGLE_GENAI_API_KEY صالح في ملف .env وإعادة تشغيل التطبيق.",
        };
    }
}
