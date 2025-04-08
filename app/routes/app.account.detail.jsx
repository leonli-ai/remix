import { json } from "@remix-run/node";
import BreadPayAppsClient from '~/breadPay-apps'; // or "@remix-run/server-runtime"

export const action = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ message: "Method Not Allowed" }, { status: 405 });
  }
  const requestBody = await request.json();
  console.log('[DEBUG] Account detail request start');
  const breadPayAppsClient = new BreadPayAppsClient();

  let payload = null

  if(requestBody.callId) {
    payload = {
      cardDataInputCapability: '1',
      cardDataInputMode: '1',
      cardHoldPresentInd: 'S',
      cardPresentInd: '0',
      posType: 'M',
      recordType: 'K',
      requestType: 'A',
      storeNumber: 9990,
      tokenId: requestBody.callId
    }
  }else{
    var birthdayFormatCheck = validateBirthday(requestBody.birthDay);
    if (!birthdayFormatCheck) {
      return json({ message: "Please provide a valid birthday (MM-DD-YYYY)" }, { status: 400 });
    }

    var birthDateParts = requestBody.birthDay.split("-");
    var formattedBirthDate = birthDateParts[0] + birthDateParts[1];
    var nameParts = requestBody.cardOwner.split(" ");
    var firstName = nameParts[0];
    var lastName = nameParts[1];
    var accountNumber = requestBody.cardNumber.replace(/\s/g, '');
    payload = {
      cardDataInputCapability: 'C',
      cardDataInputMode: 'M',
      cardHoldPresentInd: 'S',
      cardPresentInd: '0',
      correlationData: 'correlationData',
      clerkId: 'clerkId',
      posType: 'M',
      recordType: 'F',
      requestType: 'A',
      storeNumber: 9990,
      accountNumber: parseInt(accountNumber, 10),
      birthdayDate: parseInt(formattedBirthDate, 10),
      zipCode: parseInt(requestBody.zipCode, 10),
      ssn: parseInt(requestBody.last4SSN, 10),
      firstName: firstName,
      lastName: lastName
    }
  }

  if(requestBody.callId === '123') {
    return json({
      data:{
        accountSummary: [{
          name: {
            firstName: 'John',
            middleInitial: 'D',
            lastName: 'Doe',
          },
          accountNumber: 5856371234567890,
        }]
      }
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
  const res = await breadPayAppsClient.accountLookup(payload)

  console.log('[DEBUG] Account found: ', res?.data?.accountSummary);
  // Respond to the ping request
  return json(res, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};

function validateBirthday(date) {
  var regex = /^((0|1)\d{1})-((0|1|2)\d{1})-((19|20)\d{2})/;
  return regex.test(date);
}

