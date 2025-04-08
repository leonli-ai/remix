export const UPDATE_ORDER_METAFIELD = `
mutation UpdateOrderMetafield($input: OrderInput!) {
  orderUpdate(input: $input) {
    order {
      id
    metafield(namespace: "$app:custom", key: "draftOrder") {
      id
      namespace
      key
      value
    }
    }
    userErrors {
      message
      field
    }
  }
}
`;



export const ORDER_CREATE = `
  mutation OrderCreate($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) {
    orderCreate(order: $order, options: $options) {
      userErrors {
        field
        message
      }
      order {
        id
        displayFinancialStatus
        displayFulfillmentStatus
        email
        name
        phone
        processedAt
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        customer {
          id
          firstName
          lastName
          email
        }
      }
    }
  }
`; 