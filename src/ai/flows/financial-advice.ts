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
    description: 'Opens the dialog for the user to add a new income source.',
    inputSchema: z.object({}),
    outputSchema: z.object({ success: z.boolean() }),
}, async () => ({ success: true }));

const addExpenseTool = ai.defineTool({
    name: 'addExpense',
    description: 'Opens the dialog for the user to record a new expense.',
    inputSchema: z.object({}),
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
    prompt: `You are "مرشد الموازين", an expert financial guide for the "الموازين" app.
Your answers MUST be in Arabic.
Your tone MUST be professional, concise, and direct. Get straight to the point.
Provide clear, actionable guidance.

Analyze the user's data and be proactive. Use the available tools when a user's request matches a tool's purpose.

User's Financial Summary:
- Total Income: {{financials.totalIncome}}
- Total Expenses: {{financials.totalExpenses}}
- Pots:
{{#each financials.pots}}
  - Pot: "{{name}}", Balance: {{balance}}, Allocation: {{percentage}}%
{{/each}}

User's query: {{{query}}}`
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
