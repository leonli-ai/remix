import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import { BILLING_CONFIG } from "~/config/billing";

export async function loader({ request }: LoaderFunctionArgs) {
  const { billing } = await authenticate.admin(request);

  const url = new URL(request.url);
  const charge_id = url.searchParams.get("charge_id");

  console.log("charge_id", charge_id, url, JSON.stringify(url));
  if (!charge_id) {
    return redirect("/app/billing");
  }

  const hasSubscription = await billing.check(BILLING_CONFIG.SUBSCRIPTION);
  const hasOneTimePurchase = await billing.check(BILLING_CONFIG.ONE_TIME);

  console.log("hasSubscription", hasSubscription, JSON.stringify(hasSubscription));
  console.log("hasOneTimePurchase", hasOneTimePurchase, JSON.stringify(hasOneTimePurchase));

  if (!hasSubscription?.hasActivePayment && !hasOneTimePurchase?.hasActivePayment) {
    return redirect("/app/billing");
  }

  return redirect("/app");
} 