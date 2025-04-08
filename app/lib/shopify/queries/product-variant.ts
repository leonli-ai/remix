export const GET_PRODUCT_VARIANT = `
  query GetProductHandleBySku($query: String!) {
    productVariants(first: 1, query: $query) {
      edges {
        node {
          id
          sku
          title
          product {
            title
            handle
          }
        }
      }
    }
  }
`;

/**
 * Query to search for products and their variants
 */
export const SEARCH_PRODUCTS = `
  query SearchProducts($query: String!) {
    products(first: 250, query: $query) {
      nodes {
        id
        title
        description
        handle
        images(first: 1) {
          nodes {
            altText
            width
            height
            id
            url
          }
        }
        updatedAt
        onlineStoreUrl
        variants(first: 250) {
          nodes {
            id
            title
            sku
            metafield(namespace: "$app:custom", key: "custom_uom") {
                id
                namespace
                key
                value
            }
            availableForSale
            unitPriceMeasurement {
              measuredType
              quantityUnit
              quantityValue
              referenceUnit
              referenceValue
            }
          }
        }
      }
    }
  }
`;

/**
 * Query to get products visible to a company location
 */
export const GET_COMPANY_LOCATION_VISIBLE_PRODUCTS = `
  query GetCompanyLocationVisibleProducts($companyLocationId: ID!) {
    companyLocation(id: $companyLocationId) {
      id
      name
      catalogs(first: 250) {
        edges {
          node {
            id
            title
            publication {
              products(first: 250) {
                edges {
                  node {
                    id
                    title
                    handle
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_CATALOGS_FOR_COMPANY_LOCATION = `
  query GetCatalogsForCompanyLocation($first: Int, $query: String) {
    catalogs(first: $first, type: COMPANY_LOCATION, query: $query) {
      nodes {
        id
        title
        priceList {
          id
          name
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

export const GET_PRICES_FOR_PRICE_LIST = `
  query GetPricesForPriceList($priceListId: ID!) {
    priceList(id: $priceListId) {
      id
      name
      prices(first: 250) {
        nodes {
          price {
            amount
            currencyCode
          }
          variant {
            id
            sku
            product {
              title
            }
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  }
`;

export const GET_CATALOGS_PRODUCTS = `
  query GetCatalogsForCompanyLocation($first: Int, $query: String) {
    catalogs(first: $first, type: COMPANY_LOCATION, query: $query) {
      nodes {
        id
        title
        publication {
          products(first: 250) {
            edges {
              node {
                id
                title
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    }
  }
`;


export const GET_PRODUCTS_AND_VARIANTS = `
  query GetProductsAndVariants($ids: [ID!]!, $companyLocationId: ID) {
    nodes(ids: $ids) {
      ... on Product {
        id
        title
        variants(first: 250) {
          edges {
            node {
              id
              sku
              title
              contextualPricing(context: { companyLocationId: $companyLocationId }) {
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_VARIANT_PRICES = `
  query GetVariantPrices($variantIds: [ID!]!, $companyLocationId: ID!) {
    nodes(ids: $variantIds) {
      ... on ProductVariant {
        id
        title
        sku
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
`;

export const SEARCH_PRODUCTS_WITH_VISIBILITY = `
  query SearchProductsWithVisibility($query: String!, $companyLocationId: ID!) {
    # Search products with minimal fields first
    products(first: 100, query: $query) {
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
    # Get visible products with minimal fields
    companyLocation(id: $companyLocationId) {
      id
      catalogs(first: 100) {
        edges {
          node {
            id
            publication {
              products(first: 100) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
