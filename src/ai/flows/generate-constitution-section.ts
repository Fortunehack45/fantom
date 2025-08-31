'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating sections of a clan constitution.
 *
 * The flow uses a prompt to generate constitution sections based on user-provided input.
 * It exports the `generateConstitutionSection` function, the `ConstitutionSectionInput` type, and the `ConstitutionSectionOutput` type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConstitutionSectionInputSchema = z.object({
  sectionType: z
    .string()
    .describe(
      'The type of constitution section to generate (e.g., Identity & Vision, Clan Structure, Recruitment Process).'
    ),
  clanName: z.string().describe('The name of the clan.'),
  game: z.string().describe('The main game the clan focuses on.'),
  additionalDetails: z
    .string()
    .describe('Any additional details or specific requirements for the section.'),
});
export type ConstitutionSectionInput = z.infer<typeof ConstitutionSectionInputSchema>;

const ConstitutionSectionOutputSchema = z.object({
  sectionTitle: z.string().describe('The title of the generated section.'),
  sectionContent: z.string().describe('The content of the generated constitution section.'),
});
export type ConstitutionSectionOutput = z.infer<typeof ConstitutionSectionOutputSchema>;

export async function generateConstitutionSection(
  input: ConstitutionSectionInput
): Promise<ConstitutionSectionOutput> {
  return generateConstitutionSectionFlow(input);
}

const constitutionSectionPrompt = ai.definePrompt({
  name: 'constitutionSectionPrompt',
  input: {schema: ConstitutionSectionInputSchema},
  output: {schema: ConstitutionSectionOutputSchema},
  prompt: `You are an expert in creating clan constitutions for eSports teams.

  Based on the following information, generate a section for the clan constitution.

  Clan Name: {{{clanName}}}
  Section Type: {{{sectionType}}}
  Main Game: {{{game}}}
  Additional Details: {{{additionalDetails}}}

  Ensure the section is well-structured, clear, and tailored to the clan's specific needs.

  The output should contain a 'sectionTitle' and 'sectionContent' field.
  `,
});

const generateConstitutionSectionFlow = ai.defineFlow(
  {
    name: 'generateConstitutionSectionFlow',
    inputSchema: ConstitutionSectionInputSchema,
    outputSchema: ConstitutionSectionOutputSchema,
  },
  async input => {
    const {output} = await constitutionSectionPrompt(input);
    return output!;
  }
);
