import { type CrmField, type ColumnMapping } from "./schema";

export function isAiConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

export async function refineColumnMappingWithAI(
  headers: string[],
  initialMapping: ColumnMapping[]
): Promise<ColumnMapping[]> {
  // Placeholder for OpenAI integration
  // When OPENAI_API_KEY is configured, this can call OpenAI API to improve mapping
  return initialMapping;
}
