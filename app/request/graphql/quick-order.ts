export const quickOrderSearchProductGraphQL = `query searchProducts($query: String!) {
    products(first: 10, query: $query) {
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
                    metafield(key: "uom", namespace: "custom") {
                        value
                        key
                        namespace
                    }
                    quantityRule {
                      increment
                      maximum
                      minimum
                    }
                    price {
                        amount
                        currencyCode
                    }
                    unitPrice {
                        amount
                        currencyCode
                    }
                    availableForSale
                    quantityAvailable
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

export const searchProductBySkuAndTitleGraphQL = `query suggestions($query: String!,$searchableFields:[SearchableField!]) {
  predictiveSearch(query: $query, searchableFields: $searchableFields) {
    products {
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
                    metafield(key: "uom", namespace: "custom") {
                        value
                        key
                        namespace
                    }
                    quantityRule {
                      increment
                      maximum
                      minimum
                    }
                    price {
                        amount
                        currencyCode
                    }
                    unitPrice {
                        amount
                        currencyCode
                    }
                    availableForSale
                    quantityAvailable
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

export const quickOrderCreateCartGraphQL = `
    mutation cartCreate($input: CartInput) {
    cartCreate(input: $input) {
        cart {
            id
            buyerIdentity {
                email
            }
            lines(first: 250) {
                nodes {
                    id
                    merchandise {
                        ... on ProductVariant {
                            id
                            price {
                                amount
                                currencyCode
                            }
                            sku
                        }
                    }
                    quantity
                }
            }
        }
        userErrors {
            field
            message
        }
        warnings {
            code
            message
        }
    }
    }
    `;

export const quickOrderAddCartLinesGraphQL = `
mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
            id
            buyerIdentity {
                email
            }
            lines(first: 250) {
                nodes {
                    id
                    merchandise {
                        ... on ProductVariant {
                            id
                            price {
                                amount
                                currencyCode
                            }
                            sku
                        }
                    }
                    quantity
                }
            }
        }
        userErrors {
            field
            message
        }
        warnings {
            code
            message
        }
    }
    }
`;

export const queryMultipleVariants = `query getMultipleVariants($variantIds: [ID!]!) {
    nodes(ids: $variantIds) {
        ... on ProductVariant {
            id
            title
            sku
            quantityAvailable
            price {
                amount
                currencyCode
            }
            metafield(key: "uom", namespace: "custom") {
                value
                key
                namespace
            }
            quantityRule {
              increment
              maximum
              minimum
            }
            product {
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
                variants(first: 1) {
                    nodes {
                        id
                        title
                        sku
                        quantityAvailable
                        metafield(key: "uom", namespace: "custom") {
                            value
                            key
                            namespace
                        }
                        quantityRule {
                          increment
                          maximum
                          minimum
                        }
                        price {
                            amount
                            currencyCode
                        }
                        unitPrice {
                            amount
                            currencyCode
                        }
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
}
`;

export const queryMultipleProducts = `query getMultipleProducts($productIds: [ID!]!) {
  nodes(ids: $productIds) {
    ... on Product {
      id
      title
      handle
      vendor
      category {
        name
      }
      tags
      variants(first: 10) {
        nodes {
          id
          title
          sku
          availableForSale
          metafields(identifiers: [
            {
              key: "custom_uom",
              namespace: "app--193933737985--custom",
            },
            {
              key: "material",
              namespace: "app--193933737985--custom"
            },
            {
              key: "dimensions",
              namespace: "app--193933737985--custom"
            },
            {
              key: "color",
              namespace: "app--193933737985--custom"
            }
          ]) {
            value
            key
            namespace
          }
          price {
            amount
            currencyCode
          }
          weight
          weightUnit
        }
      }
      images(first: 1) {
        edges {
          node {
            url
          }
        }
      }
    }
  }
}`;

export const queryCart = `
query getCart($cartId: ID!) {
    cart(id: $cartId) {
        id
        lines(first: 100) {
            nodes {
                id
                quantity
                merchandise {
                    ... on ProductVariant {
                        id
                        title
                        sku
                        price {
                            amount
                            currencyCode
                        }
                        product {
                            title
                            description
                        }
                    }
                }
            }
        }
    }
}

`;
