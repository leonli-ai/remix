import schema from "./payments-apps.schema";

import {
  updatePaymentSessionStatus,
  updateRefundSessionStatus,
  updateCaptureSessionStatus,
  updateVoidSessionStatus,
  RESOLVE,
  REJECT,
  PENDING
} from "./payments.repository";

export default class BreadPayAppsClient {
  async authorizeSale(payload:any) {
    const responseObj = {
      error: false,
      data: null,
      msg: '',
    };

    try {
      const saleResponse = await fetch(`${process.env.PAYMENT_BASE_URL}/auth/v5/authorization/sale`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${process.env.PAYMENT_API_TOKEN}`,
          client_token:process.env.PAYMENT_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      responseObj.data = await saleResponse.json();
    } catch (e: any) {
      console.log("BreadPay authorizeSale error", e);
      responseObj.msg = e;
      responseObj.error = true;
    }
    // console.log("BreadPay authorizeSale", payload, responseObj);
    return responseObj;
  }

  async void(payload:any) {
    const responseObj = {
      error: false,
      data: null,
      msg: '',
    };
    payload.originalAmount = payload.transactionAmount
    try {
      const saleResponse = await fetch(`${process.env.PAYMENT_BASE_URL}/auth/v5/authorization/sale`, {
        method: 'PATCH',
        headers: {
          Authorization: `Basic ${process.env.PAYMENT_API_TOKEN}`,
          client_token:process.env.PAYMENT_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      responseObj.data = await saleResponse.json();
    } catch (e: any) {
      responseObj.msg = e;
      responseObj.error = true;
    }
    console.log("BreadPay void", responseObj);
    return responseObj;
  }

  async accountLookup(payload:any) {
    const responseObj = {
      error: false,
      data: null,
      msg: '',
    };

    try {
      const res = await fetch(`${process.env.PAYMENT_BASE_URL}/account/v4/r3/detail`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${process.env.PAYMENT_API_TOKEN}`,
          client_token:process.env.PAYMENT_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const detailResponse = await res.json();
      if (detailResponse.data?.errorMessage === 'MATCH NOT FOUND') {
        responseObj.error = true;
        responseObj.msg = 'checkbalance match not found';
      } else {
        responseObj.data = detailResponse.data;
      }
      responseObj.data = detailResponse;
    } catch (e: any) {
      console.log("BreadPay accountLookup error", e);
      responseObj.msg = e;
      responseObj.error = true;
    }
    // console.log("BreadPay accountLookup", payload, responseObj);
    return responseObj;
  }
}
