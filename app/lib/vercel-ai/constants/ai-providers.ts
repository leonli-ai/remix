/**
 * Supported AI providers
 */
export const AI_PROVIDERS = {
  OPENAI: 'openai',
  CUSTOM: 'custom',
} as const;

export type AIProvider = typeof AI_PROVIDERS[keyof typeof AI_PROVIDERS];

/**
 * Default configuration values
 */
export const AI_DEFAULTS = {
  MODEL: 'google/gemini-2.0-flash-001',
  API_BASE_URL: 'https://openrouter.ai/api/v1',
  PROVIDER: AI_PROVIDERS.OPENAI,
} as const; 