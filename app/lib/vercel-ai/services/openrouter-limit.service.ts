import { loggerService } from '~/lib/logger/services/logger.service';
import { OpenRouterLimitConfig, OpenRouterLimitResponse } from '../interfaces/openrouter-limit.interface';

export class OpenRouterLimitService {
  private static instance: OpenRouterLimitService;
  private config: OpenRouterLimitConfig;
  private readonly CLASS_NAME = 'OpenRouterLimitService';

  private constructor(config: OpenRouterLimitConfig) {
    this.config = config;
  }

  public static getInstance(config: OpenRouterLimitConfig): OpenRouterLimitService {
    if (!OpenRouterLimitService.instance) {
      OpenRouterLimitService.instance = new OpenRouterLimitService(config);
    }
    return OpenRouterLimitService.instance;
  }

  public async checkLimit(): Promise<boolean> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch OpenRouter limits: ${response.status} ${response.statusText}`);
      }

      const data: OpenRouterLimitResponse = await response.json();
      
      loggerService.info(`${this.CLASS_NAME}: OpenRouter limit response`, {
       ...data
      });

      // If there's no limit set, we assume it's unlimited
      if (data.data.limit === null) {
        return true;
      }

      // Calculate usage percentage based on usage value (which is already a percentage)
      if (data.data.usage >= this.config.maxUsagePercentage) {
        loggerService.warn(`${this.CLASS_NAME}: OpenRouter API usage exceeded threshold`, {
          usage: data.data.usage,
          threshold: this.config.maxUsagePercentage
        });
        return false;
      }

      return true;
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}: Error checking OpenRouter limits`, {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack
        } : 'Unknown error'
      });
      return false;
    }
  }
} 