export const getVariantPricesOperation = {
  tags: ['Product Variant'],
  summary: 'Get prices for multiple variants',
  description: 'Retrieve prices for multiple product variants based on company location',
  operationId: 'getVariantPrices',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'customerId', 'companyLocationId', 'variantIds'],
        properties: {
          storeName: {
            type: 'string',
            description: 'The name of the store',
            example: 'my-store.myshopify.com'
          },
          customerId: {
            type: 'string',
            description: 'The ID of the customer',
            example: 'gid://shopify/Customer/12345'
          },
          companyLocationId: {
            type: 'string',
            description: 'The ID of the company location for contextual pricing',
            example: 'gid://shopify/CompanyLocation/67890'
          },
          variantIds: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Array of product variant IDs',
            example: ['gid://shopify/ProductVariant/1', 'gid://shopify/ProductVariant/2']
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Successfully retrieved variant prices',
      schema: {
        type: 'object',
        properties: {
          variantPrices: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'Variant ID'
                },
                title: {
                  type: 'string',
                  description: 'Variant title'
                },
                sku: {
                  type: 'string',
                  description: 'Variant SKU'
                },
                price: {
                  type: 'object',
                  properties: {
                    amount: {
                      type: 'string',
                      description: 'Price amount'
                    },
                    currencyCode: {
                      type: 'string',
                      description: 'Currency code (e.g. USD, EUR)',
                      example: 'USD'
                    }
                  }
                },
                quantityRule: {
                  type: 'object',
                  properties: {
                    minimum: { type: 'number' },
                    maximum: { type: 'number' },
                    increment: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '400': {
      description: 'Invalid request parameters',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Invalid parameters'
          },
          code: {
            type: 'number',
            example: 400
          }
        }
      }
    },
    '401': {
      description: 'Unauthorized access',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Unauthorized'
          },
          code: {
            type: 'number',
            example: 401
          }
        }
      }
    },
    '500': {
      description: 'Internal server error',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Internal server error'
          },
          code: {
            type: 'number',
            example: 500
          }
        }
      }
    }
  }
}; 