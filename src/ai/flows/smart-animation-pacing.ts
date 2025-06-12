// src/ai/flows/smart-animation-pacing.ts
'use server';

/**
 * @fileOverview A flow that adjusts the progress animation speed based on the selected time and remaining time.
 *
 * - adjustAnimationPace - A function that takes the selected time and remaining time as input and returns the adjusted animation pace.
 * - AdjustAnimationPaceInput - The input type for the adjustAnimationPace function.
 * - AdjustAnimationPaceOutput - The return type for the adjustAnimationPace function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustAnimationPaceInputSchema = z.object({
  selectedTime: z.number().describe('The initially selected time in seconds.'),
  remainingTime: z.number().describe('The remaining time in seconds.'),
});
export type AdjustAnimationPaceInput = z.infer<typeof AdjustAnimationPaceInputSchema>;

const AdjustAnimationPaceOutputSchema = z.object({
  animationPace: z
    .number()
    .describe(
      'The adjusted animation pace, a value between 0 and 1, where 0 is paused and 1 is normal speed.'
    ),
  reasoning: z
    .string()
    .describe(
      'The reasoning behind the animation pace.  Explain why the animationPace was chosen.'
    ),
});
export type AdjustAnimationPaceOutput = z.infer<typeof AdjustAnimationPaceOutputSchema>;

export async function adjustAnimationPace(input: AdjustAnimationPaceInput): Promise<AdjustAnimationPaceOutput> {
  return adjustAnimationPaceFlow(input);
}

const adjustAnimationPacePrompt = ai.definePrompt({
  name: 'adjustAnimationPacePrompt',
  input: {schema: AdjustAnimationPaceInputSchema},
  output: {schema: AdjustAnimationPaceOutputSchema},
  prompt: `You are an expert in UX and animation pacing.

  Given the selected time and the remaining time of a countdown timer, determine an appropriate animation pace for the progress animation.

  The animation pace should be a value between 0 and 1, where 0 means paused, and 1 means normal speed.

  Consider the following:
  - If the remaining time is very low compared to the selected time, the animation pace should be faster so the user knows when time is up.
  - If the remaining time is high, the animation pace should be normal, or slightly slower.

  Selected Time: {{selectedTime}} seconds
  Remaining Time: {{remainingTime}} seconds

  Reasoning:`,
});

const adjustAnimationPaceFlow = ai.defineFlow(
  {
    name: 'adjustAnimationPaceFlow',
    inputSchema: AdjustAnimationPaceInputSchema,
    outputSchema: AdjustAnimationPaceOutputSchema,
  },
  async input => {
    const {output} = await adjustAnimationPacePrompt(input);
    return output!;
  }
);
