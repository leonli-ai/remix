/**
 * Options for configuring the Language Learning Model
 */
export interface LLMOptions {
  /** Model identifier to use for the request */
  model?: string;
  
  /** Temperature for controlling randomness in the response (0-1) */
  temperature?: number;
  
  /** Maximum number of tokens to generate */
  maxTokens?: number;
  
  /** API key for authentication */
  apiKey?: string;
  
  /** Base URL for the API endpoint */
  baseURL?: string;
} 