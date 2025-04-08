export const GET_DRAFT_ORDERS = `
  query DraftOrderList(
    $first: Int,
    $after: String,
    $query: String,
    $sortKey: DraftOrderSortKeys,
    $reverse: Boolean
  ) {
    draftOrders(
      first: $first
      after: $after
      query: $query
      sortKey: $sortKey
      reverse: $reverse
    ) {
      edges {
        cursor
        node {
          id
          name
          tags
          metafields(first: 250, namespace: "$app:custom") {
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
            displayName
            email
            firstName
            lastName
            numberOfOrders
          }
          poNumber
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
                externalId
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
          hasTimelineComment
          note2
          status
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
            presentmentMoney {
              amount
              currencyCode
            }
          }
          updatedAt
        }
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
      }
    }
  }
`;

export const GET_DRAFT_ORDER_DETAILS = `
  query GetDraftOrderDetails($draftOrderId: ID!, $companyLocationId: ID) {
    draftOrder(id: $draftOrderId) {
      id
      name
      status
      email
      note2
      tags
      metafields(first: 250, namespace: "$app:custom") {
        edges {
          node {
            namespace
            key
            value
          }
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
              id
              lastName
              numberOfOrders
              phone
            }
          }
          location {
            id
            name
            externalId
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
      customer {
        id
        displayName
        email
        firstName
        lastName
        numberOfOrders
        phone
        defaultAddress {
          formattedArea
          id
          address1
          address2
          city
          countryCode
          province
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
      phone
      poNumber
      createdAt
      updatedAt
      taxExempt
      taxesIncluded
      currencyCode
      totalQuantityOfLineItems
      lineItems(first: 250) {
        edges {
          cursor
          node {
            id
            uuid
            appliedDiscount {
              amountSet {
                presentmentMoney {
                  amount
                  currencyCode
                  __typename
                }
                shopMoney {
                  amount
                  currencyCode
                  __typename
                }
                __typename
              }
              value
              valueType
              description
              __typename
            }
            isCustomLineItem: custom
            discountedTotalSet {
              presentmentMoney {
                amount
                currencyCode
                __typename
              }
              shopMoney {
                amount
                currencyCode
                __typename
              }
              __typename
            }
            discountedUnitPriceSet {
              presentmentMoney {
                amount
                currencyCode
                __typename
              }
              shopMoney {
                amount
                currencyCode
                __typename
              }
              __typename
            }
            image {
              id
              altText
              transformedSrc: url(transform: {maxWidth: 40, maxHeight: 40, scale: 3})
              __typename
            }
            isGiftCard
            originalTotal
            originalUnitPriceSet {
              presentmentMoney {
                amount
                currencyCode
                __typename
              }
              shopMoney {
                amount
                currencyCode
                __typename
              }
              __typename
            }
            product {
              id
              title
              totalVariants
              __typename
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
            weight {
              value
              unit
              __typename
            }
          }
        }
      }
      billingAddress {
        firstName
        lastName
        address1
        address2
        city
        provinceCode
        zip
        countryCodeV2
        company
        phone
      }
      shippingAddress {
        firstName
        lastName
        address1
        address2
        city
        provinceCode
        zip
        countryCodeV2
        company
        phone
      }
      shippingLine {
        id
        custom
        shippingRateHandle
        title
        deliveryCategory
        code
        source
        discountedPriceSet {
          presentmentMoney {
            amount
            currencyCode
            __typename
          }
          shopMoney {
            amount
            currencyCode
            __typename
          }
          __typename
        }
        originalPriceSet {
          presentmentMoney {
            amount
            currencyCode
            __typename
          }
          shopMoney {
            amount
            currencyCode
            __typename
          }
          __typename
        }
        __typename
      }
      totalPriceSet {
        presentmentMoney {
          amount
          currencyCode
        }
        shopMoney {
          amount
          currencyCode
        }
      }
      totalTaxSet {
        presentmentMoney {
          amount
          currencyCode
        }
        shopMoney {
          amount
          currencyCode
        }
      }
      totalDiscountsSet {
        presentmentMoney {
          amount
          currencyCode
        }
        shopMoney {
          amount
          currencyCode
        }
      }
      lineItemsSubtotalPrice {
        presentmentMoney {
          amount
          currencyCode
        }
        shopMoney {
          amount
          currencyCode
        }
      }
      customAttributes {
        key
        value
      }
    }
  }
`;

export const GET_DRAFT_ORDER_METAFIELDS = `
  query DraftOrderMetafields($ownerId: ID!) {
    draftOrder(id: $ownerId) {
      id
      metafield(namespace: "$app:custom", key: "operator_info") {
        id
        namespace
        key
        value
      }
    }
  }
`;