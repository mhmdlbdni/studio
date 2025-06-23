'use server';
/**
 * @fileOverview An AI agent that provides financial advice to users and can interact with the app.
 *
 * - getFinancialAdvice - A function that takes a user's query and financial data, and returns financial advice or a tool request.
 * - FinancialAdviceInput - The input type for the getFinancialAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {generate} from 'genkit/generate';

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
export const FinancialAdviceInputSchema = z.object({
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
export type FinancialAdviceInput = z.infer<typeof FinancialAdviceInputSchema>;


const financialAdvicePrompt = `You are "مرشد الموازين", a professional, creative, and friendly financial guide for the "الموازين" app. Your primary role is to help users achieve financial well-being.
Your answers MUST be concise, encouraging, and delivered in Arabic.

You have access to the user's real-time financial data and a set of tools to help them manage their finances directly.

- **Analyze their data:** Look at their income, expenses, and how their pots are balanced. Provide actionable, personalized advice based on what you see.
- **Be proactive:** If they ask a question that can be solved by an action, suggest that action. For example, if they say "I got paid", suggest adding an income.
- **Use tools when appropriate:** If the user's request matches a tool's description, use that tool. For example, if they say "أضف مصروفي" (add my expense), use the 'addExpense' tool. If they ask how to change pot percentages, use the 'navigateTo' tool to send them to 'manage-pots'.

User's Financial Summary:
- Total Income: {{financials.totalIncome}}
- Total Expenses: {{financials.totalExpenses}}
- Pots:
{{#each financials.pots}}
  - Pot: "{{name}}", Balance: {{balance}}, Allocation: {{percentage}}%
{{/each}}

Begin the conversation now.

User's query: {{{query}}}`;

/**
 * This flow takes the user's query and financial data, calls the AI model,
 * and returns the response, which may include text or a request to use a tool.
 * The client is responsible for handling the tool request.
 */
export async function getFinancialAdvice(input: FinancialAdviceInput) {
    return await generate({
        prompt: financialAdvicePrompt,
        model: 'googleai/gemini-2.0-flash',
        input: input,
        tools: [addIncomeTool, addExpenseTool, navigateToTool],
    });
}
