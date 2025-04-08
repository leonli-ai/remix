import { json } from "@remix-run/node";
import {sessionStorage} from '~/shopify.server';
import { createRefundSession, getRefundSession } from "~/payments.repository";
import PaymentsAppsClient, {REFUND} from '~/payments-apps.graphql';
import {checkCert} from '~/payments.certificate';

/**
 * Saves and starts a refund session.
 */
export const action = async ({ request }) => {
  console.log('Refund session action started');

  const certRes = checkCert(request)
  if(!certRes) {
    console.log('Refund session check certificate failed');
    return json({}, {status: 401});
  }

  const requestBody = await request.json();
  const shopDomain = request.headers.get('shopify-shop-domain');
  console.log('Shop domain:', shopDomain);
  const refundSessionParams = createParams(requestBody);
  console.log('Refund payment Id:', requestBody.id)
  let refundSession = await getRefundSession(refundSessionParams.id);

  if (!refundSession) {
    console.log('Creating new refund session', refundSessionParams.id);
    refundSession = await createRefundSession(refundSessionParams);
  } else {
    console.log('Using existing refund session', refundSession.id);
  }
  if (!refundSession) throw new Response("A RefundSession couldn't be created.", { status: 500 });
  setTimeout(async ()=>{
    console.log('Refund session processing...');
    const session = (await sessionStorage.findSessionsByShop(shopDomain))[0];
    const client = new PaymentsAppsClient(shopDomain, session.accessToken, REFUND);
    console.log('Refund resolved');
    await client.resolveSession(refundSession)
  })
  console.log('Refund session action finished');
  return json(refundSessionParams);



}

const createParams = ({id, gid, payment_id, proposed_at}) => (
  {
    id,
    gid,
    paymentId: payment_id,
    proposedAt: proposed_at,
  }
)
