import { json } from "@remix-run/node";

import { createCaptureSession, getCaptureSession } from "~/payments.repository";
import {sessionStorage} from '~/shopify.server';
import PaymentsAppsClient, {CAPTURE} from '~/payments-apps.graphql';
import {checkCert} from '~/payments.certificate';

/**
 * Saves and starts a capture session.
 */
export const action = async ({ request }) => {
  console.log('Capture session action started');
  const certRes = checkCert(request)
  if(!certRes) {
    console.log('Capture session check certificate failed');
    return json({}, {status: 401});
  }
  const requestBody = await request.json();
  const shopDomain = request.headers.get('shopify-shop-domain');
  console.log('Shop domain:', shopDomain);
  const captureSessionParams = createParams(requestBody);
  console.log('Capture payment Id:', requestBody.id)
  let captureSession = await getCaptureSession(captureSessionParams.id);

  if (!captureSession) {
    console.log('Creating new capture session', captureSessionParams.id);
    captureSession = await createCaptureSession(captureSessionParams);
  } else {
    console.log('Using existing capture session', captureSession.id);
  }
  if (!captureSession) throw new Response("A CaptureSession couldn't be created.", { status: 500 });
  setTimeout(async ()=>{
    console.log('Capture session processing...');
    const session = (await sessionStorage.findSessionsByShop(shopDomain))[0];
    const client = new PaymentsAppsClient(shopDomain, session.accessToken, CAPTURE);
    console.log('Capture resolved');
    await client.resolveSession(captureSession)
  })
  console.log('Capture session action finished');
  return json(captureSessionParams);
}

const createParams = ({id, gid, payment_id, proposed_at}) => (
  {
    id,
    gid,
    paymentId: payment_id,
    proposedAt: proposed_at,
  }
)
