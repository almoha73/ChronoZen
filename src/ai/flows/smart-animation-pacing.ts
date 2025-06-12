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
  selectedTime: z.number().describe('Le temps initialement sélectionné en secondes.'),
  remainingTime: z.number().describe('Le temps restant en secondes.'),
});
export type AdjustAnimationPaceInput = z.infer<typeof AdjustAnimationPaceInputSchema>;

const AdjustAnimationPaceOutputSchema = z.object({
  animationPace: z
    .number()
    .describe(
      "La vitesse d'animation ajustée, une valeur entre 0 et 1, où 0 est en pause et 1 est la vitesse normale."
    ),
  reasoning: z
    .string()
    .describe(
      "Le raisonnement derrière la vitesse d'animation. Expliquez pourquoi animationPace a été choisi."
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
  prompt: `Vous êtes un expert en UX et en rythme d'animation.

  Compte tenu du temps sélectionné et du temps restant d'un compte à rebours, déterminez une vitesse d'animation appropriée pour l'animation de progression.

  La vitesse d'animation doit être une valeur comprise entre 0 et 1, où 0 signifie en pause et 1 signifie vitesse normale.

  Considérez ce qui suit :
  - Si le temps restant est très faible par rapport au temps sélectionné, la vitesse d'animation doit être plus rapide pour que l'utilisateur sache quand le temps est écoulé.
  - Si le temps restant est élevé, la vitesse d'animation doit être normale ou légèrement plus lente.

  Temps sélectionné : {{selectedTime}} secondes
  Temps restant : {{remainingTime}} secondes

  Raisonnement :`,
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
