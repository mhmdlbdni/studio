
'use server';
/**
 * @fileOverview مرشد مالي ذكي مطور ومدرب على فلسفة نظام "الموازين" (الأوعية الستة).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
        balance: z.number().describe("رصيد الوعاء الحالي."),
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

const addIncomeTool = ai.defineTool({
    name: 'addIncome',
    description: 'تسجيل دخل جديد للمستخدم وتوزيعه على الأوعية.',
    inputSchema: z.object({
        description: z.string().describe('وصف الدخل (مثلاً: راتب يناير).'),
        amount: z.number().describe('مبلغ الدخل بالرقم فقط.'),
    }),
    outputSchema: z.string(),
}, async () => "تم إرسال طلب تسجيل الدخل بنجاح.");

const addExpenseTool = ai.defineTool({
    name: 'addExpense',
    description: 'تسجيل مصروف جديد والخصم من وعاء محدد.',
    inputSchema: z.object({
        description: z.string().describe('وصف المصروف.'),
        amount: z.number().describe('المبلغ.'),
        potId: z.string().describe('معرف الوعاء المطلوب الخصم منه.'),
    }),
    outputSchema: z.string(),
}, async () => "تم إرسال طلب تسجيل المصروف بنجاح.");

const navigateToTool = ai.defineTool({
    name: 'navigateTo',
    description: 'الانتقال إلى صفحات الإعدادات أو إدارة الأوعية بناءً على طلب المستخدم.',
    inputSchema: z.object({
        page: z.enum(['manage-pots', 'settings', 'transactions']).describe('الصفحة الهدف.'),
    }),
    outputSchema: z.string(),
}, async () => "جاري توجيهك إلى الصفحة المطلوبة.");

const financialAdvicePrompt = ai.definePrompt({
    name: 'financialAdvicePrompt',
    input: { schema: FinancialAdviceInputSchema },
    model: 'googleai/gemini-1.5-flash',
    tools: [addIncomeTool, addExpenseTool, navigateToTool],
    prompt: `أنت "مرشد الموازين"، خبير مالي ذكي متخصص في نظام "الأوعية الستة" (6-Jars System). 
مهمتك هي مساعدة المستخدم في إدارة ماله بذكاء وحكمة وفق الفلسفة التالية:

**فلسفة نظام الموازين:**
1. **وعاء الضروريات (55%)**: للمصاريف الحتمية.
2. **وعاء الحرية المالية (10%)**: للاستثمار وبناء الثروة.
3. **وعاء التوفير طويل الأجل (10%)**: للطوارئ والمشتريات الكبيرة.
4. **وعاء التعليم (10%)**: لتطوير الذات.
5. **وعاء المرح والترفيه (10%)**: للاستمتاع بالحياة.
6. **وعاء العطاء (5%)**: للصدقة والمساعدة.

**قواعد الرد الصارمة:**
- استخدم الأرقام الإنجليزية دائماً (1, 2, 3...) في المبالغ والنسب. يمنع استخدام الأرقام الهندية (١، ٢، ٣...).
- كن ودوداً، مختصراً، وعملياً باللغة العربية.
- قدم نصائح بناءً على الأرصدة الحالية الموضحة أدناه.

**بيانات المستخدم:**
- الدخل: {{financials.totalIncome}}
- المصاريف: {{financials.totalExpenses}}
- حالة الأوعية:
{{#each financials.pots}}
  * {{name}}: رصيد {{balance}} ({{percentage}}%)
{{/each}}

سؤال المستخدم: {{{query}}}`,
});

const financialAdviceFlow = ai.defineFlow(
  {
    name: 'financialAdviceFlow',
    inputSchema: FinancialAdviceInputSchema,
  },
  async (input) => {
    const response = await financialAdvicePrompt(input);
    return {
      text: response.text,
      toolRequests: response.toolRequests || [],
      success: true
    };
  }
);

export async function getFinancialAdvice(input: FinancialAdviceInput) {
    return await financialAdviceFlow(input);
}
