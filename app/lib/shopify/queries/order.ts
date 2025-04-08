export const GET_ORDERS = `
  query GetOrdersAndCount($query: String, $first: Int, $after: String, $last: Int, $before: String, $sortKey: OrderSortKeys, 
    $reverse: Boolean) {
    orders(first: $first, after: $after, last: $last, before: $before, query: $query,sortKey:$sortKey,reverse:$reverse) {
      edges {
        cursor
        node {
          id
          name
          createdAt
          closed
          cancelledAt
          metafields(first: 250) {
            edges {
              node {
                namespace
                key
                value
              }
            }
          }
          customer {
            id
            email
            firstName
            lastName
          }
          tags
          currentTotalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          purchasingEntity {
            ... on Customer {
              defaultAddress {
                formattedArea
                id
              }
              displayName
              email
              firstName
              
              id
              lastName
              numberOfOrders
              phone
            }
            ... on PurchasingCompany {
              company {
                id
                name
              }
              contact {
                id
                customer {
                  displayName
                  email
                  firstName
                  
                  
                  lastName
                  numberOfOrders
                  phone
                }
              }
              location {
                id
                name
                shippingAddress {
                  address1
                  address2
                  city
                  countryCode
                  formattedArea
                  id
                  province
                }
              }
            }
          }
          poNumber
          paymentGatewayNames
          paymentTerms {
            id
            paymentTermsName
            paymentTermsType
            dueInDays
            overdue
            paymentSchedules(first: 250) {
              edges {
                node {
                  dueAt
                  issuedAt
                }
              }
            }
          }
          displayFinancialStatus
          displayFulfillmentStatus
          returnStatus
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
    }
    ordersCount(query: $query) {
      count
      precision
    }
  }
`;

export const GET_ORDER_DETAILS = `
  query GetOrderDetails($orderId: ID!, $companyLocationId: ID) {
    order(id: $orderId) {
      id
      name
      email
      note
      createdAt
      closed
      cancelledAt
      metafields(first: 250, namespace: "$app:custom") {
        edges {
          node {
            namespace
            key
            value
          }
        }
      }
      paymentTerms {
            id
            paymentTermsName
            paymentTermsType
            dueInDays
            overdue
            paymentSchedules(first: 250) {
              edges {
                node {
                  dueAt
                  issuedAt
                }
              }
            }
      }
      purchasingEntity {
        ... on PurchasingCompany {
          company {
            id
            name
          }
          location {
            id
            name
            externalId
          }
        }
      }
      customer {
        id
        displayName
        email
        firstName
        lastName
        numberOfOrders
        companyContactProfiles {
          company {
            locations(first: 250) {
              edges {
                node {
                  id
                  name
                }
              }
            }
          }
        }
      }
      phone
      poNumber
      createdAt
      updatedAt
      taxExempt
      taxesIncluded
      currencyCode
      lineItems(first:250) {
        edges {
          cursor
          node {
            id
            discountedTotalSet {
              presentmentMoney {
                amount
                currencyCode
              }
              shopMoney {
                amount
                currencyCode
              }
            }
            discountedUnitPriceSet {
              presentmentMoney {
                amount
                currencyCode
              }
              shopMoney {
                amount
                currencyCode
              }
            }
            image {
              id
              altText
              transformedSrc: url(transform: {maxWidth: 40, maxHeight: 40, scale: 3})
            }
            isGiftCard
            originalTotal
            originalUnitPriceSet {
              presentmentMoney {
                amount
                currencyCode
              }
              shopMoney {
                amount
                currencyCode
              }
            }
            product {
              id
              title
              description
              totalVariants
            }
            quantity
            requiresShipping
            sku
            taxable
            title
            variantTitle
            variant {
              id
              price
              contextualPricing(context: {companyLocationId: $companyLocationId}) {
                price {
                  amount
                }
              }
              metafield(namespace: "$app:custom", key: "custom_uom") {
                id
                namespace
                key
                value
              }
            }
          }
        }
      }
      subtotalPriceSet {
        shopMoney {
          amount
          currencyCode
        }
      }
      totalPriceSet {
        shopMoney {
          amount
          currencyCode
        }
      }
      totalShippingPriceSet {
        shopMoney {
          amount
          currencyCode
        }
      }
      totalTaxSet {
        shopMoney {
          amount
          currencyCode
        }
      }
      totalDiscountsSet {
        shopMoney {
          amount
          currencyCode
        }
      }
      billingAddress {
        firstName
        lastName
        address1
        address2
        city
        province
        provinceCode
        zip
        country
        countryCodeV2
        company
        phone
      }
      shippingAddress {
        firstName
        lastName
        address1
        address2
        province
        city
        provinceCode
        zip
        country
        countryCodeV2
        company
        phone
      }
      shippingLine {
        title
        code
        source
        originalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
      }
      subtotalPriceSet{
        presentmentMoney {
          amount
          currencyCode
        }
        shopMoney {
          amount
          currencyCode
        }
      }
      
      paymentGatewayNames
      displayFinancialStatus
      displayFulfillmentStatus
      returnStatus
      tags
      customAttributes {
        key
        value
      }
    }
  }
`; 