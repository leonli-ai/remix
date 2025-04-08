import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { useState } from "react";
import { BILLING_CONFIG, getBillingMutationVariables } from "~/config/billing";
import { CREATE_ONE_TIME_PURCHASE, CREATE_SUBSCRIPTION } from "~/graphql/mutations/billing";

export default function BillingPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscription = async (type: "recurring" | "one-time") => {
    setIsLoading(true);
    try {
      const query = type === "recurring" 
        ? CREATE_SUBSCRIPTION
        : CREATE_ONE_TIME_PURCHASE;

      const returnUrl = `${process.env.SHOPIFY_APP_URL}/app/billing/confirm`;
      const variables = getBillingMutationVariables(
        type === "recurring" ? "subscription" : "one-time", 
        returnUrl
      );

      const response = await fetch('/api/v1/admin/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      const result = await response.json();
      const confirmationUrl = type === "recurring" 
        ? result.data.appSubscriptionCreate.confirmationUrl
        : result.data.appPurchaseOneTimeCreate.confirmationUrl;

      if (result.data.userErrors?.length > 0) {
        throw new Error(result.data.userErrors[0].message);
      }

      window.location.href = confirmationUrl;
    } catch (error) {
      console.error("Failed to create subscription:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">Choose Your Plan</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Plan</h2>
          <div className="text-3xl font-bold mb-4">
            ${BILLING_CONFIG.SUBSCRIPTION.amount}
            <span className="text-base font-normal">/month</span>
          </div>
          <ul className="mb-6 space-y-2">
            <li>✓ Feature 1</li>
            <li>✓ Feature 2</li>
            <li>✓ Feature 3</li>
          </ul>
          <Button 
            onClick={() => handleSubscription("recurring")}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Processing..." : "Subscribe Now"}
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Lifetime Access</h2>
          <div className="text-3xl font-bold mb-4">
            ${BILLING_CONFIG.ONE_TIME.amount}
          </div>
          <ul className="mb-6 space-y-2">
            <li>✓ All Monthly Features</li>
            <li>✓ One-time Payment</li>
            <li>✓ Lifetime Updates</li>
          </ul>
          <Button
            onClick={() => handleSubscription("one-time")}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Processing..." : "Purchase Lifetime Access"}
          </Button>
        </Card>
      </div>
    </div>
  );
} 