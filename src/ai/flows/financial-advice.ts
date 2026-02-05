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
    })).describe("A list of the user's financial pots."),
    transactions: z.array(z.object({
        id: z.string(),
        type: z.enum(['income', 'expense']),
        description: z.string(),
        amount: z.number(),
        date: z.string(),
        potId: z.string().optional(),
    })).optional().describe("A list of the user's recent transactions. Use this to answer questions about spending details.")
  }),
});
export type FinancialAdviceInput = z.infer<typeof FinancialAdviceInputSchema>;

// Define tools for the AI to interact with the application
const addIncomeTool = ai.defineTool({
    name: 'addIncome',
    description: 'إضافة دخل جديد للمستخدم. استخدم هذا عندما يطلب المستخدم تسجيل راتب أو أي دخل مالي آخر بشكل صريح.',
    inputSchema: z.object({
        description: z.string().describe('وصف الدخل (مثلاً: راتب يونيو)'),
        amount: z.number().describe('المبلغ'),
    }),
    outputSchema: z.string(),
}, async () => "تم إرسال طلب إضافة الدخل للتطبيق.");

const addExpenseTool = ai.defineTool({
    name: 'addExpense',
    description: 'إضافة مصروف جديد للمستخدم. استخدم هذا عندما يطلب المستخدم تسجيل نفقة أو شراء شيء ما بشكل صريح.',
    inputSchema: z.object({
        description: z.string().describe('وصف المصروف (مثلاً: فاتورة كهرباء)'),
        amount: z.number().describe('المبلغ'),
        potId: z.string().describe('معرف الوعاء (id) الذي سيتم الخصم منه. ابحث عن المعرف المناسب من قائمة الأوعية الموفرة لك.'),
    }),
    outputSchema: z.string(),
}, async () => "تم إرسال طلب إضافة المصروف للتطبيق.");

const navigateToTool = ai.defineTool({
    name: 'navigateTo',
    description: 'مساعدة المستخدم في التنقل لصفحة الإعدادات أو إدارة الموازين.',
    inputSchema: z.object({
        page: z.enum(['manage-pots', 'settings']).describe('اسم الصفحة المراد الانتقال إليها'),
    }),
    outputSchema: z.string(),
}, async () => "تم إرسال طلب التنقل.");


const financialAdvicePrompt = ai.definePrompt({
    name: 'financialAdvicePrompt',
    input: { schema: FinancialAdviceInputSchema },
    model: 'googleai/gemini-2.0-flash',
    tools: [addIncomeTool, addExpenseTool, navigateToTool],
    prompt: `أنت "مرشد الموازين"، خبير مالي ذكي ومساعد شخصي في تطبيق "الموازين". مهمتك هي تمكين المستخدمين من تحقيق أهدافهم المالية من خلال التحليل الذكي والإرشاد الفعال والقيام بالإجراءات البسيطة نيابة عنهم.

**قدراتك الأساسية:**
- **التحليل المالي الشامل:** يمكنك تحليل الوضع المالي الكامل للمستخدم (الدخل، المصروفات، الأوعية، والمعاملات الفردية) وتقديم رؤى واضحة وموجزة حوله. ابحث عن الأنماط، سلط الضوء على نقاط القوة والضعف، وقدم نصائح عملية. عند سؤال المستخدم عن تفاصيل مصروفاته مثل "على ماذا صرفت؟"، استخدم قائمة المعاملات لتقديم إجابة مفصلة. يمكنك تجميع المصروفات حسب الوصف أو الوعاء لتقديم رؤى أفضل.
- **الإرشاد التفاعلي:** إذا سأل المستخدم عن كيفية استخدام التطبيق (مثل "كيف أضيف مصروف؟")، قدم له إرشادات واضحة ومختصرة خطوة بخطوة، أو عرض مساعدته للقيام بذلك باستخدام الأدوات المتاحة لك.
- **تنفيذ الإجراءات:** يمكنك استخدام الأدوات (tools) المتاحة لك لإضافة دخل، إضافة مصروف، أو مساعدة المستخدم في التنقل لصفحات الإعدادات. لا تنفذ هذه الإجراءات إلا إذا طلب المستخدم ذلك أو وافق على عرضك للقيام بها.
- **الشخصية:** كن محترفاً، ودوداً، ومشجعاً. استخدم لغة بسيطة وإيجابية. اجعل ردودك مختصرة ومباشرة.
- **اللغة:** تواصل دائماً باللغة العربية الفصحى المبسطة والواضحة.

**بيانات المستخدم المالية (لتحليلها وتقديم رؤى حولها):**
*   إجمالي الدخل: {{financials.totalIncome}}
*   إجمالي المصروفات: {{financials.totalExpenses}}
*   الأوعية المالية (الموازين):
    {{#each financials.pots}}
    *   **{{name}}**: الرصيد الحالي: {{balance}}، النسبة المخصصة من الدخل: {{percentage}}% (المعرف: {{id}})
    {{/each}}
*   قائمة المعاملات (لتحليل المصروفات والإجابة على أسئلة مثل "على ماذا صرفت؟"):
    {{#if financials.transactions}}
    {{#each financials.transactions}}
    *   **{{type}}**: {{description}} - المبلغ: {{amount}} - التاريخ: {{date}} {{#if potId}}- معرف الوعاء: {{potId}}{{/if}}
    {{/each}}
    {{else}}
    * لا توجد معاملات مسجلة بعد.
    {{/if}}

**سجل المحادثة (للسياق):**
{{#if history}}
{{#each history}}
*   **{{sender}}**: {{text}}
{{/each}}
{{/if}}

**استعلام المستخدم الحالي:** {{{query}}}
---
تذكر، مهمتك هي تحليل الوضع المالي وتقديم الإرشاد، واستخدام الأدوات لمساعدة المستخدم عند الحاجة.`,
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
            toolRequests: response.toolRequests,
        };
    } catch (e) {
        const error = e as Error;
        console.error("Error in getFinancialAdvice flow:", error);
        
        let message = 'عذراً، حدث خطأ ما في الاتصال بالمرشد. يرجى التأكد من اتصال الإنترنت أو صلاحية مفتاح الخدمة.';
        
        if (error.message && (error.message.includes('API key') || error.message.includes('permission') || error.message.includes('403'))) {
            message = 'عذراً، هناك مشكلة في صلاحيات مفتاح الخدمة (API Key). يرجى التحقق من صحته في إعدادات النظام.';
        }

        return {
            text: message,
        }
    }
}
