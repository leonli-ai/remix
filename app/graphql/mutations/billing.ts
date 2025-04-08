export const CREATE_SUBSCRIPTION = `#graphql
  mutation createSubscription($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!) {
    appSubscriptionCreate(
      name: $name
      lineItems: $lineItems
      returnUrl: $returnUrl
      test: true
    ) {
      appSubscription {
        id
        status
      }
      confirmationUrl
      userErrors {
        field
        message
      }
    }
  }
`;

export const CREATE_ONE_TIME_PURCHASE = `#graphql
  mutation createPayment($name: String!, $price: MoneyInput!, $returnUrl: URL!) {
    appPurchaseOneTimeCreate(
      name: $name
      price: $price
      returnUrl: $returnUrl
      test: true
    ) {
      appPurchaseOneTime {
        id
        status
      }
      confirmationUrl
      userErrors {
        field
        message
      }
    }
  }
`; 