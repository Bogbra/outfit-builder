import { z } from "zod";

// Two concrete, explainable styling heuristics for the MVP. A DB-backed,
// admin-configurable rule engine is out of scope until the product
// actually needs rule authoring.
export const compatibilityRuleTypeSchema = z.enum(["style-overlap", "color-count"]);
export type CompatibilityRuleType = z.infer<typeof compatibilityRuleTypeSchema>;

export const compatibilitySeveritySchema = z.enum(["info", "warning"]);
export type CompatibilitySeverity = z.infer<typeof compatibilitySeveritySchema>;

export const compatibilityWarningSchema = z.object({
  type: compatibilityRuleTypeSchema,
  message: z.string(),
  severity: compatibilitySeveritySchema,
});

export type CompatibilityWarning = z.infer<typeof compatibilityWarningSchema>;
