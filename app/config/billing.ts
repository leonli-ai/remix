export const BILLING_CONFIG = {
  // Monthly subscription plan
  SUBSCRIPTION: {
    isTest: process.env.NODE_ENV !== 'production',
    chargeName: "Monthly Subscription",
    amount: 0.1,
    currencyCode: "USD" as const,
    interval: "EVERY_30_DAYS" as const,
  },
  
  // One-time purchase plan
  ONE_TIME: {
    isTest: process.env.NODE_ENV !== 'production',
    chargeName: "One-time Purchase",
    amount: 1.0,
    currencyCode: "USD" as const,
  }
} as const;

// Helper function to get billing check options
export function getBillingCheckOptions(type: 'subscription' | 'one-time') {
  return type === 'subscription' 
    ? BILLING_CONFIG.SUBSCRIPTION 
    : BILLING_CONFIG.ONE_TIME;
}

// Helper function to get billing mutation variables
export function getBillingMutationVariables(type: 'subscription' | 'one-time', returnUrl: string) {
  if (type === 'subscription') {
    return {
      name: BILLING_CONFIG.SUBSCRIPTION.chargeName,
      lineItems: [
        {
          plan: {
            appRecurringPricingDetails: {
              price: { 
                amount: BILLING_CONFIG.SUBSCRIPTION.amount, 
                currencyCode: BILLING_CONFIG.SUBSCRIPTION.currencyCode 
              },
              interval: BILLING_CONFIG.SUBSCRIPTION.interval,
            },
          },
        },
      ],
      returnUrl,
    };
  }
  
  return {
    name: BILLING_CONFIG.ONE_TIME.chargeName,
    price: { 
      amount: BILLING_CONFIG.ONE_TIME.amount, 
      currencyCode: BILLING_CONFIG.ONE_TIME.currencyCode 
    },
    returnUrl,
  };
} 