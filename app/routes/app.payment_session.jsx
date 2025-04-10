import {createPaymentSession, getPaymentSession} from '~/payments.repository';
import {json} from '@remix-run/node';
import {format} from 'date-fns';
import {sessionStorage} from '~/shopify.server';
import PaymentsAppsClient, {PAYMENT} from '~/payments-apps.graphql';
import BreadPayAppsClient from '~/breadPay-apps';
import {checkCert} from '~/payments.certificate';
import {encryptWithPublicKey} from '~/encrypt';

/**
 * Saves and starts a payment session.
 * Redirects back to shop if payment session was created.
 */
export const action = async ({request}) => {
  console.log('Payment session action started');

  const certRes = checkCert(request)
  if(!certRes) {
    console.log('Payment session check certificate failed');
    return json({}, {status: 401});
  }
  const requestBody = await request.json();
  const {test, payment_method, amount, proposed_at, customer} = requestBody;
  const shopDomain = request.headers.get('shopify-shop-domain');
  console.log('Shop domain:', shopDomain);

  const testCards = JSON.parse(process.env.PAYMENT_TEST_CARDS || '[]');

  const paymentMethodData = payment_method.data;
  const attributes = JSON.parse(paymentMethodData.attributes || '[]');
  const cardNumber = attributes.find(attr => attr.key.toLowerCase() === 'card_number')?.value;
  // Check if card number is empty
  if (!cardNumber) {
    console.error('Card number is empty');
    throw new Response('Card number is required.', { status: 400 });
  }
  const maskedCardNumber = String(cardNumber).slice(-4);
  console.log('Card number (last 4 digits):', maskedCardNumber);

  const paymentSessionParams = createParams(requestBody, encryptWithPublicKey(String(cardNumber)), shopDomain);

  const currentPaymentSession = await getPaymentSession(paymentSessionParams.id);

  let paymentSession;
  if (!currentPaymentSession) {
    console.log('Creating new payment session', paymentSessionParams.id);
    paymentSession = await createPaymentSession(paymentSessionParams);
  } else {
    console.log('Using existing payment session', currentPaymentSession?.id);
    paymentSession = currentPaymentSession;
  }

  if (!paymentSession) {
    console.error('Failed to create or retrieve payment session');
    throw new Response('A PaymentSession couldn\'t be created.', {status: 500});
  }

  if (test && testCards.includes(cardNumber)) {
    console.log('Test transaction with valid test card');
    setTimeout(async ()=>{
      console.log('Test Payment session processing...');
      const session = (await sessionStorage.findSessionsByShop(paymentSession.shop))[0];
      const client = new PaymentsAppsClient(session.shop, session.accessToken, PAYMENT);
      await client.resolveSession(paymentSession);
    })
  } else {
    console.log('Processing real transaction');
    const zipCode = customer.billing_address.postal_code || '';
    const zipCodeArr = zipCode.split('-');
    const avsValidation = {
      'address': customer.billing_address.line1,
      'zipCode': parseInt(zipCodeArr[0], 10),
    }
    if(zipCodeArr[1]) {
      avsValidation.zipCodePlus4 = parseInt(zipCodeArr[1], 10);
    }
    console.log('[DEBUG] Billing address', avsValidation);
    const payload = {
      'accountNumber': cardNumber,
      'cardDataInputCapability': '1',
      'cardDataInputMode': '1',
      'cardHolderPresentInd': 'S',
      'cardPresentInd': '0',
      'posType': 'E',
      'stan': Math.floor(100000 + Math.random() * 900000),
      'storeNumber': 99996,
      'transactionAmount': Number(amount),
      'transactionDate': parseInt(format(new Date(proposed_at), 'yyMMdd'), 10),
      'transactionTime': parseInt(format(new Date(proposed_at), 'HHmmss'), 10),
      'avsValidation':avsValidation
    };
    setTimeout(async () => {
      console.log('Processing real transaction...');
      const AVS_RESPONSE_DECLINED_STATUS_CODES = ['A', 'N', 'S', 'R', 'I', 'E'];
      var isCardValid = validateCardNumber(cardNumber);
      const breadPayAppsClient = new BreadPayAppsClient();
      const session = (await sessionStorage.findSessionsByShop(paymentSession.shop))[0];
      const client = new PaymentsAppsClient(session.shop, session.accessToken, PAYMENT);
      if(!isCardValid) {
        console.log('Card number is not valid');
        await client.rejectSession(paymentSession, 'card number is not valid');
        return
      }
      const response = await breadPayAppsClient.authorizeSale(payload);

      if (response.error || response.data?.returnCode !== 'A') {
        console.error('Bread payment processor failed: returnCode is ', response.data?.returnCode, response, response.error);
        await client.rejectSession(paymentSession, 'payment processor not supported');
      } else if (AVS_RESPONSE_DECLINED_STATUS_CODES.includes(response.data.avsResponse) || !isCardValid) {
        console.error('Avs validation failed: avsResponse is ', response.data.avsResponse);
        // await breadPayAppsClient.void(payload);
        await client.rejectSession(paymentSession, 'plcc invalid billing address');
      } else {
        await client.resolveSession(paymentSession);
        console.log('Payment resolved successfully');
      }
    });
  }
  console.log('Payment session action finished');
  return json({}, {status: 201});
};

const createParams = ({
                        id,
                        gid,
                        group,
                        kind,
                        payment_method,
                        proposed_at,
                      }, cardNumber,shopDomain) => (
  {
    id,
    gid,
    group,
    kind,
    paymentMethod: JSON.stringify({"type": "ashley_plcc","data": {"encrypted_card": cardNumber}}),
    proposedAt: proposed_at,
    cancelUrl: payment_method.data.cancel_url,
    shop: shopDomain,
  }
);

const buildRedirectUrl = (request, id, resolution) => {
  return `${request.url.slice(0, request.url.lastIndexOf('/'))}/payment_simulator/${id}?resolution=${resolution}`;
};

function validateCardNumber(cardNumber) {
  var isValid = true;
  isValid = /^(585637|200|219)\d{5,13}$/.test(cardNumber);
  return isValid;
}
