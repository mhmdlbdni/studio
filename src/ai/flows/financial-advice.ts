
'use server';
/**
 * @fileOverview An AI agent that provides financial analysis and guidance.
 *
 * - getFinancialAdvice - A function that takes a user's query and returns analysis or instructional advice.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Define the input schema for the flow
const FinancialAdviceInputSchema = z.object({
  query: z.string().describe('The user query for financial advice.'),
  history: z.array(z.object({
    sender: z.string(),
    text: z.string(),
  })).optional().describe('The conversation history.'),
  financials: z.object({
    totalIncome: z.number().describe("The user's total income."),
    totalExpenses: z.number().describe("The user's total expenses."),
    pots: z.array(z.object({
        id: z.string().describe("The unique identifier for the pot."),
        name: z.string().describe("The name of the financial pot."),
        percentage: z.number().describe("The allocated percentage for the pot."),
        balance: z.number().describe("The current balance of the pot."),
    })).describe("A list of the user's financial pots.")
  }),
});
type FinancialAdviceInput = z.infer<typeof FinancialAdviceInputSchema>;


const financialAdvicePrompt = ai.definePrompt({
    name: 'financialAdvicePrompt',
    input: { schema: FinancialAdviceInputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `أنت "مرشد الموازين"، خبير مالي ذكي ومساعد شخصي في تطبيق "الموازين". مهمتك هي تمكين المستخدمين من تحقيق أهدافهم المالية من خلال التحليل الذكي والإرشاد الفعال.

**قدراتك الأساسية:**
- **التحليل المالي:** يمكنك تحليل الوضع المالي للمستخدم (الدخل، المصروفات، الأوعية) وتقديم رؤى واضحة وموجزة حوله. ابحث عن الأنماط، سلط الضوء على نقاط القوة والضعف، وقدم نصائح عملية.
- **الإرشاد التفاعلي:** إذا سأل المستخدم عن كيفية استخدام التطبيق (مثل "كيف أضيف مصروف؟")، قدم له إرشادات واضحة ومختصرة خطوة بخطوة.
- **الشخصية:** كن محترفاً، ودوداً، ومشجعاً. استخدم لغة بسيطة وإيجابية. اجعل ردودك مختصرة ومباشرة.
- **اللغة:** تواصل دائماً باللغة العربية الفصحى المبسطة والواضحة.

**مثال على تحليل مالي:**
- **سؤال المستخدم:** "حلل وضعي المالي."
- **ردك المحتمل:** "بالتأكيد! بناءً على بياناتك، يبدو أن صافي رصيدك إيجابي، وهذا رائع. لقد خصصت 10% من دخلك للحرية المالية، وهو استثمار ممتاز في مستقبلك. لاحظت أن وعاء 'الترفيه' يستهلك جزءاً كبيراً من المصروفات. قد يكون من المفيد مراجعة هذه النفقات إذا كنت تسعى لزيادة مدخراتك. هل تود إرشادات حول كيفية تتبع المصروفات بدقة أكبر؟"

**مثال على الإرشاد:**
- **سؤال المستخدم:** "كيف أضيف راتبي؟"
- **ردك:** "لإضافة دخلك:
1. اضغط على زر (+) الأزرق في الشاشة الرئيسية.
2. اختر "إضافة دخل".
3. املأ تفاصيل الدخل والمبلغ.
4. اضغط على "توزيع الدخل".
أنا هنا إذا احتجت مساعدة إضافية! 😊"

**لا تقم بتنفيذ أي إجراءات بنفسك.** دورك هو التحليل والإرشاد فقط.

**بيانات المستخدم المالية (لتحليلها وتقديم رؤى حولها):**
*   إجمالي الدخل: {{financials.totalIncome}}
*   إجمالي المصروفات: {{financials.totalExpenses}}
*   الأوعية المالية (الموازين):
    {{#each financials.pots}}
    *   **{{name}}**: الرصيد الحالي: {{balance}}، النسبة المخصصة من الدخل: {{percentage}}%
    {{/each}}

**سجل المحادثة (للسياق):**
{{#if history}}
{{#each history}}
*   **{{sender}}**: {{text}}
{{/each}}
{{/if}}

**استعلام المستخدم الحالي:** {{{query}}}
---
تذكر، مهمتك هي تحليل الوضع المالي وتقديم الإرشاد، وليس تنفيذ الإجراءات.`,
});


/**
 * This flow takes the user's query and financial data, calls the AI model,
 * and returns the response, which will contain analysis or instructional text.
 */
export async function getFinancialAdvice(input: FinancialAdviceInput) {
    try {
        const response = await financialAdvicePrompt(input);

        return {
            text: response.text,
        };
    } catch (e) {
        const error = e as Error;
        console.error("Error in getFinancialAdvice flow:", error);
        
        let message = 'عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى.';
        // Check for common API key related error messages
        if (error.message && (error.message.includes('API key') || error.message.includes('permission'))) {
            message = 'عذراً، حدث خطأ في الاتصال بالمرشد الذكي. قد تكون هناك مشكلة في إعدادات الخدمة.';
        }

        return {
            text: message,
        }
    }
}
