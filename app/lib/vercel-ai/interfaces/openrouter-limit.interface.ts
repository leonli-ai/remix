export interface OpenRouterLimitResponse {
  data: {
    label: string;
    limit: number | null;
    usage: number;
    is_provisioning_key: boolean;
    limit_remaining: number | null;
    is_free_tier: boolean;
    rate_limit: {
      requests: number;
      interval: string;
    };
  };
}

export interface OpenRouterLimitConfig {
  maxUsagePercentage: number;
  emailNotificationEnabled: boolean;
  notificationEmail?: string;
} 