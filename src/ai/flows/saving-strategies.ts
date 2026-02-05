'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting saving strategies to users.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { gemini15Flash } from '@genkit-ai/google-genai';

const SavingStrategiesInputSchema = z.object({
  income: z.number().describe('The user’s total monthly income.'),
  expenses: z.number().describe('The user’s total monthly expenses.'),
  financialGoals: z.string().describe('The user’s financial goals e.g., buying a car, saving for retirement.'),
});
export type SavingStrategiesInput = z.infer<typeof SavingStrategiesInputSchema>;

const SavingStrategiesOutputSchema = z.object({
  strategies: z.string().describe('A list of saving strategies tailored to the user’s income, expenses, and financial goals.'),
});
export type SavingStrategiesOutput = z.infer<typeof SavingStrategiesOutputSchema>;

export async function getSavingStrategies(input: SavingStrategiesInput): Promise<SavingStrategiesOutput> {
  return savingStrategiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'savingStrategiesPrompt',
  input: {schema: SavingStrategiesInputSchema},
  output: {schema: SavingStrategiesOutputSchema},
  model: gemini15Flash,
  prompt: `You are a financial advisor. Based on the user's income, expenses, and financial goals, provide personalized saving strategies.

Income: {{{income}}}
Expenses: {{{expenses}}}
Financial Goals: {{{financialGoals}}}

Provide a list of actionable saving strategies that the user can implement to achieve their goals faster.`,
});

const savingStrategiesFlow = ai.defineFlow(
  {
    name: 'savingStrategiesFlow',
    inputSchema: SavingStrategiesInputSchema,
    outputSchema: SavingStrategiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
