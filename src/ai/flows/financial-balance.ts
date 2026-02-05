'use server';
/**
 * @fileOverview A flow for providing financial advice and suggestions for better financial balance.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FinancialBalanceInputSchema = z.object({
  income: z.number().describe('Total monthly income.'),
  expenses: z.record(z.string(), z.number()).describe('A map of expense categories to amounts spent.'),
  pots: z.record(z.string(), z.number()).describe('A map of budget categories (pots) to their allocated percentages.'),
});
export type FinancialBalanceInput = z.infer<typeof FinancialBalanceInputSchema>;

const FinancialBalanceOutputSchema = z.object({
  advice: z.string().describe('Financial advice and suggestions for better financial balance.'),
});
export type FinancialBalanceOutput = z.infer<typeof FinancialBalanceOutputSchema>;

const prompt = ai.definePrompt({
  name: 'financialBalancePrompt',
  input: {schema: FinancialBalanceInputSchema},
  output: {schema: FinancialBalanceOutputSchema},
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are a financial advisor. Analyze the user's financial situation and provide advice on how to achieve a better financial balance.

  Here is the user's monthly income: {{income}}
  Here is a breakdown of the user's expenses:
  {{#each expenses}}
  - {{key}}: {{value}}
  {{/each}}
  Here is the user's current budget allocation (pots):
  {{#each pots}}
  - {{key}}: {{value}}%
  {{/each}}

  Based on this information, provide specific and actionable advice to help the user manage their money more effectively. Focus on suggesting saving strategies and ways to improve their financial balance, such as reallocating budget percentages or reducing expenses in certain categories.
`,
});

export async function getFinancialBalanceAdvice(input: FinancialBalanceInput): Promise<FinancialBalanceOutput> {
  const response = await prompt(input);
  return response.output!;
}
