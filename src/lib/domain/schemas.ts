/**
 * Zod schemas for runtime validation of all domain data.
 * Defines TransitData, StewardQuery, LLMResponse, and SupportedLanguage.
 * @module schemas
 */
import { z } from 'zod';

/** Supported language codes for multilingual steward dispatch. */
export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'pt', 'ar'] as const;

/** Zod schema for validating supported language codes. */
export const SupportedLanguageSchema = z.enum(SUPPORTED_LANGUAGES);

/** TypeScript type for supported language codes. */
export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

/**
 * Zod schema for transit hub telemetry data.
 * Validates crowd levels, capacity, EV counts, and sustainability metrics.
 */
export const TransitDataSchema = z.object({
  hubId: z.string().min(1, 'Hub ID is required'),
  hubName: z.string().min(1, 'Hub name is required'),
  crowdLevel: z.number().int().min(0, 'Crowd level must be non-negative'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
  wavAvailable: z.number().int().min(0, 'WAV count must be non-negative'),
  evShuttleCount: z.number().int().min(0, 'EV count must be non-negative'),
  carbonOffsetPct: z.number().min(0).max(100, 'Carbon offset must be 0–100'),
  waterRefillStations: z.number().int().min(0),
  status: z.enum(['comfortable', 'busy', 'critical']),
});

/** TypeScript type inferred from TransitDataSchema. */
export type TransitData = z.infer<typeof TransitDataSchema>;

/**
 * Zod schema for steward chat queries.
 * Validates question length and language code.
 */
export const StewardQuerySchema = z.object({
  question: z
    .string()
    .min(1, 'Question cannot be empty')
    .max(500, 'Question cannot exceed 500 characters'),
  language: SupportedLanguageSchema.default('en'),
});

/** TypeScript type inferred from StewardQuerySchema. */
export type StewardQuery = z.infer<typeof StewardQuerySchema>;

/**
 * Zod schema for Gemini LLM response validation.
 * Ensures the AI always returns a non-empty answer with a language tag.
 */
export const LLMResponseSchema = z.object({
  answer: z.string().min(1, 'Answer cannot be empty'),
  language: SupportedLanguageSchema,
});

/** TypeScript type inferred from LLMResponseSchema. */
export type LLMResponse = z.infer<typeof LLMResponseSchema>;
