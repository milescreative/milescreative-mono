import { z } from 'zod';

export const FontSchema = z.object({
  id: z.string(),
  family: z.string(),
  subsets: z.array(z.string()),
  weights: z.array(z.number()),
  styles: z.array(z.string()),
  defSubset: z.string(),
  variable: z.boolean(),
  lastModified: z.string(),
  category: z.string(),
  license: z.string(),
  type: z.string(),
  // Optional fields
  unicodeRange: z.record(z.string()).optional(),
  version: z.string().optional(),
  variants: z.record(z.unknown()).optional(),
});

export type Font = z.infer<typeof FontSchema>;
export const FontsResponseSchema = z.array(FontSchema);
