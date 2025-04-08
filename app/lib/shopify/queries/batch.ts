export const BATCH_GET_DRAFT_ORDER_METAFIELDS = `
  query BatchGetDraftOrderMetafields($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on DraftOrder {
        id
        metafield(namespace: "$app:custom", key: "operator_info") {
          value
        }
      }
    }
  }
`;

export const BATCH_GET_CUSTOMERS = `
  query BatchGetCustomers($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Customer {
        id
        firstName
        lastName
        email
        phone
        state
        createdAt
        updatedAt
      }
    }
  }
`;

/**
 * Query to get product variants by IDs with pricing information
 */
export const BATCH_GET_VARIANT_PRICES = `
  query GetVariantPrices($variantIds: [ID!]!, $companyLocationId: ID!) {
    nodes(ids: $variantIds) {
      ... on ProductVariant {
        id
        title
        sku
        inventoryQuantity
        metafield(key: "custom_uom", namespace: "$app:custom") {
              value
              key
              namespace
        }
        contextualPricing(context: { companyLocationId: $companyLocationId }) {
          price {
            amount
            currencyCode
          }
          quantityRule {
            minimum
            maximum
            increment
          }
        }
        image{  
          altText
          height
          width
          id
          url
        }
        product{
            id
            title
            handle
            images(first: 250) {
            nodes {
                id
                url
            }
        }
        }
      }
    }
  }
`;

/**
 * Query to get products by IDs
 */
export const BATCH_GET_PRODUCTS = `
  query GetProductsByIds($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        title
        description
        vendor
        totalInventory
        tracksInventory
      }
    }
  }
`; 



export const BATCG_GET_COMPANYLOCATIONS = `
query GetCompanyLocations($companyLocationIds: [ID!]!) {
  nodes(ids: $companyLocationIds) {
    ... on CompanyLocation {
      id
      name
      company{
          id
          name
      }
      shippingAddress{
          address1
          address2
          city
          companyName
          country
          countryCode
          formattedAddress
          phone
          province
          zip
          zoneCode
      }
      billingAddress{
          address1
          address2
          city
          companyName
          country
          countryCode
          formattedAddress
          phone
          province
          zip
          zoneCode
      }
    }
  }
}
`