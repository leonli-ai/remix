import { json } from "@remix-run/node";
import {sessionStorage} from '~/shopify.server';
import { createVoidSession, getVoidSession } from "~/payments.repository";
import {checkCert} from '~/payments.certificate';
import PaymentsAppsClient, {VOID} from '~/payments-apps.graphql';

const createParams = ({id, gid, payment_id, proposed_at}) => (
  {
    id,
    gid,
    paymentId: payment_id,
    proposedAt: proposed_at,
  }
)

/**
 * Saves and starts a void session.
 */
export const action = async ({ request }) => {

  console.log('Void session action started');

  const certRes = checkCert(request)
  if(!certRes) {
    console.log('Void session check certificate failed');
    return json({}, {status: 401});
  }

  const requestBody = await request.json();
  const shopDomain = request.headers.get('shopify-shop-domain');
  console.log('Shop domain:', shopDomain);
  const voidSessionParams = createParams(requestBody);
  console.log('Void payment Id:', requestBody.id)
  let voidSession = await getVoidSession(voidSessionParams.id);

  if (!voidSession) {
    console.log('Creating new void session', voidSessionParams.id);
    voidSession = await createVoidSession(voidSessionParams);
  } else {
    console.log('Using existing void session', voidSession.id);
  }
  if (!voidSession) throw new Response("A VoidSession couldn't be created.", { status: 500 });
  setTimeout(async ()=>{
    console.log('Void session processing...');
    const session = (await sessionStorage.findSessionsByShop(shopDomain))[0];
    const client = new PaymentsAppsClient(shopDomain, session.accessToken, VOID);
    console.log('Void resolved');
    await client.resolveSession(voidSession)
  })
  console.log('Void session action finished');
  return json(voidSessionParams);
}
