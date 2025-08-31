'use server';

import {
  generateConstitutionSection,
  type ConstitutionSectionInput,
  type ConstitutionSectionOutput,
} from '@/ai/flows/generate-constitution-section';
import { z } from 'zod';

const ConstitutionSectionInputSchema = z.object({
  sectionType: z.string(),
  clanName: z.string(),
  game: z.string(),
  additionalDetails: z.string().optional(),
});

export async function handleGenerateSection(
  input: Omit<ConstitutionSectionInput, 'additionalDetails'> & { additionalDetails?: string }
): Promise<ConstitutionSectionOutput> {
  const validatedInput = ConstitutionSectionInputSchema.parse(input);
  
  const result = await generateConstitutionSection({
    ...validatedInput,
    additionalDetails: validatedInput.additionalDetails || "No additional details provided.",
  });
  
  return result;
}
