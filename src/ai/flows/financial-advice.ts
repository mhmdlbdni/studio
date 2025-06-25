
'use server';
/**
 * @fileOverview An AI agent that provides instructional guidance for using the app.
 *
 * - getFinancialAdvice - A function that takes a user's query and returns instructional advice.
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
    // No tools are defined, as the guide is instructional only.
    prompt: `أنت "مرشد الموازين"، مساعد ودود ومتخصص في تطبيق "الموازين". مهمتك هي إرشاد المستخدمين وتعليمهم كيفية استخدام التطبيق بفعالية.

**مهمتك الأساسية (مهم جداً):**
- **أنت مرشد فقط (Guide Only):** دورك يقتصر على الشرح والتوضيح. **لا تقم أبداً بتنفيذ أي إجراءات بنفسك.** لا تضيف دخلاً، لا تسجل مصروفات، ولا تتنقل بين الصفحات.
- **إرشادات خطوة بخطوة:** عندما يسأل المستخدم عن كيفية القيام بشيء ما (مثل إضافة دخل، أو تعديل الموازين)، قدم له تعليمات واضحة وبسيطة على شكل خطوات.
- **كن ودوداً ومختصراً:** استخدم لغة بسيطة، واضحة، ومشجعة. يجب أن تكون ردودك قصيرة ومباشرة.
- **دائماً باللغة العربية:** يجب أن تكون جميع اتصالاتك باللغة العربية الفصحى المبسطة والواضحة.

**مثال على كيفية الرد:**
- **سؤال المستخدم:** "كيف أضيف راتبي؟"
- **ردك الصحيح:** "لإضافة دخلك:
1.  اضغط على زر (+) الأزرق في الشاشة الرئيسية.
2.  اختر "إضافة دخل".
3.  املأ تفاصيل الدخل والمبلغ.
4.  اضغط على "توزيع الدخل".
إذا واجهت أي صعوبة، أنا هنا لمساعدتك! 😊"

**لا تستخدم الأدوات أبداً.** ركز فقط على تقديم الإرشادات.

**بيانات المستخدم المالية (للسياق فقط، لا تتفاعل معها):**
*   إجمالي الدخل: {{financials.totalIncome}}
*   إجمالي المصروفات: {{financials.totalExpenses}}
*   الأوعية:
    {{#each financials.pots}}
    *   **{{name}}**: الرصيد: {{balance}}، النسبة المخصصة: {{percentage}}%
    {{/each}}

**سجل المحادثة (للسياق):**
{{#if history}}
{{#each history}}
*   **{{sender}}**: {{text}}
{{/each}}
{{/if}}

**استعلام المستخدم الحالي:** {{{query}}}
---
تذكر، أنت المرشد الذي يساعد المستخدم على استخدام التطبيق، لا المستخدم الفعلي.`,
});


/**
 * This flow takes the user's query and financial data, calls the AI model,
 * and returns the response, which will only contain instructional text.
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
