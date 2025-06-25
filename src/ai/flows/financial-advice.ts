
'use server';
/**
 * @fileOverview An AI agent that provides financial advice to users and can interact with the app.
 *
 * - getFinancialAdvice - A function that takes a user's query and financial data, and returns financial advice or a tool request.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define Tools that the AI can request to use.
// The actual logic is handled on the client, but the definitions here tell the AI what's possible.

const addIncomeTool = ai.defineTool({
    name: 'addIncome',
    description: 'Records a new source of income. If the description or amount is missing from the user query, you must ask the user for the missing information before calling this tool.',
    inputSchema: z.object({
        description: z.string().describe('A brief description of the income source.'),
        amount: z.number().describe('The amount of income.'),
    }),
    outputSchema: z.object({ success: z.boolean() }),
}, async () => ({ success: true }));

const addExpenseTool = ai.defineTool({
    name: 'addExpense',
    description: 'Records a new expense. If the description, amount, or which pot to use are missing, you must ask the user for the missing details. The user must choose from the available pots listed in their financial summary. When calling the tool, you must use the corresponding pot ID from the financial summary data, not the pot name.',
    inputSchema: z.object({
        description: z.string().describe('A brief description of the expense.'),
        amount: z.number().describe('The amount of the expense.'),
        potId: z.string().describe("The ID of the pot from which the expense is paid."),
    }),
    outputSchema: z.object({ success: z.boolean() }),
}, async () => ({ success: true }));


const navigateToTool = ai.defineTool({
    name: 'navigateTo',
    description: 'Navigates the user to a specific page within the application.',
    inputSchema: z.object({ page: z.string().describe("The page to navigate to. Can be 'manage-pots' or 'settings'.") }),
    outputSchema: z.object({ success: z.boolean() }),
}, async () => ({ success: true }));


// Define the input schema for the flow
const FinancialAdviceInputSchema = z.object({
  query: z.string().describe('The user query for financial advice.'),
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
    tools: [addIncomeTool, addExpenseTool, navigateToTool],
    prompt: `أنت "مرشد الموازين"، الخبير المالي الاستراتيجي والمرشد الشخصي في تطبيق "الموازين". شخصيتك هي مزيج فريد من خبير مالي متمرس وموجه مبدع ومشجع. مهمتك هي تمكين المستخدمين من تحقيق الإتقان المالي بثقة ووضوح.

**مبادئك الأساسية:**
1.  **استباقي وذو بصيرة:** لا تجب على الأسئلة فقط. قم بتحليل البيانات المالية للمستخدم لتحديد الاتجاهات والفرص والمشكلات المحتملة. قدم نصائح غير مطلوبة، واحتفل بنجاحاتهم (مثل الالتزام بالميزانية)، وأشر بلطف إلى مجالات التحسين.
2.  **مختصر وخبير:** قدم نصائحك بدقة احترافية. يجب أن تكون ردودك واضحة ومباشرة وخالية من المصطلحات المعقدة. انتقل مباشرة إلى صلب الموضوع، ولكن بنبرة دافئة وداعمة.
3.  **تفاعل إبداعي:** استخدم تشبيهات إبداعية واستعارات بسيطة لجعل المفاهيم المالية المعقدة مفهومة ولا تُنسى. صغ إرشاداتك بطريقة تلهم العمل.
4.  **تنفيذ لا تشوبه شائبة:** عندما يطلب المستخدم إجراءً (مثل إضافة دخل أو مصروف)، يجب عليك التعامل معه بسلاسة.
    *   إذا كنت بحاجة إلى مزيد من المعلومات (مثل المبلغ أو الوصف أو الوعاء)، فاطلبها بوضوح وإيجاز في المحادثة.
    *   بمجرد حصولك على التفاصيل، استدعِ الأداة المناسبة لتنفيذ الإجراء.
    *   لا تقم بتأكيد الإجراء بنفسك. سيوفر التطبيق رسالة تأكيد بعد استخدام الأداة بنجاح.
5.  **دائماً باللغة العربية:** يجب أن تكون جميع اتصالاتك باللغة العربية.

**تحليل هذه البيانات:**
*   **إجمالي الدخل:** {{financials.totalIncome}}
*   **إجمالي المصروفات:** {{financials.totalExpenses}}
*   **الأوعية:**
    {{#each financials.pots}}
    *   **{{name}}**: الرصيد: {{balance}}، النسبة المخصصة: {{percentage}}%
    {{/each}}

**استعلام المستخدم:** {{{query}}}

---
هدفك الأساسي هو أن تكون شريكًا ماليًا يُحدث تحولًا. تجاوز كونك مجرد مساعد بسيط لتصبح مرشدًا لا غنى عنه في رحلة المستخدم نحو الازدهار المالي.`
});


/**
 * This flow takes the user's query and financial data, calls the AI model,
 * and returns the response, which may include text or a request to use a tool.
 * The client is responsible for handling the tool request.
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
        
        let message = 'عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى.';
        // Check for common API key related error messages
        if (error.message && (error.message.includes('API key') || error.message.includes('permission'))) {
            message = 'عذراً، حدث خطأ في الاتصال بالمرشد الذكي. قد تكون هناك مشكلة في إعدادات الخدمة.';
        }

        return {
            text: message,
            toolRequests: [],
        }
    }
}
