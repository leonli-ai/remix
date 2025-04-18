import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { useState } from "react";
import { BILLING_CONFIG, getBillingMutationVariables } from "~/config/billing";
import { CREATE_ONE_TIME_PURCHASE, CREATE_SUBSCRIPTION } from "~/graphql/mutations/billing";
import type {LoaderFunctionArgs} from '@remix-run/node';
import {authenticate} from '~/shopify.server';


export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { session } = await authenticate.admin(request);
    return { shop: session.shop };
  }catch (e){
    console.log("app-test-error", e,JSON.stringify(e))
  }
};

export default function BillingPage() {

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">test</h1>
    </div>
  );
}
