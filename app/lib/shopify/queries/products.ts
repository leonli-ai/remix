export const GET_PRODUCTS = `
  query getAllProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          title
          variants(first: 100) {
            edges {
              node {
                id
                sku
                price
                inventoryItem {
                  id
                  inventoryLevels(first: 100) {
                    edges {
                      node {
                        
                        location {
                          id
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_PRODUCT = `
  query getProduct($id: ID!) {
    product(id: $id) {
      id
      title
      handle
      description
      priceRangeV2 {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            sku
            price
          }
        }
      }
    }
  }
`; 


export const GET_PRICE_AND_SKU_ID_BY_PRODUCT_ID_AND_COMPANY_LOCATION_ID = `
  query GetProductVariant($productId: ID!, $companyLocationId: ID!) {
  productVariant(id: $productId) {
    id
    contextualPricing(context: {companyLocationId: $companyLocationId}) {
        price {
            amount
            currencyCode
        }
    }
  }
}
`;

export const GET_PRODUCTS_BY_SKUS = `
  query getProductsBySKUs($query: String!, $first: Int!,$companyLocationId:ID) {
    products(first: $first, query: $query) {
      nodes {
        id
        title
        description
        handle
        onlineStoreUrl
        images(first: 1) {
          nodes {
            id
            url
          }
        }
        updatedAt
        variants(first: 100) {
          nodes {
            id
            title
            sku
            price
            inventoryQuantity
            availableForSale
            sellableOnlineQuantity
            metafield(namespace: "$app:custom", key: "custom_uom") {
              id
              namespace
              key
              value
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
          }
        }
      }
    }
  }
`;

