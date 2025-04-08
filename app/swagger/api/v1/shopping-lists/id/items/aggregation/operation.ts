export const shoppingListItemsAggregationOperation = {
  tags: ['Shopping-List'],
  summary: 'Get aggregated information for shopping list items',
  description: 'Retrieves total item count, subtotal, and currency code for a shopping list',
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      type: 'string',
      description: 'Shopping list ID'
    },
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        properties: {
          storeName: {
            type: 'string',
            description: 'Store name',
            example: 'acme-store.myshopify.com'
          },
          customerId: {
            type: 'string',
            description: 'Customer ID',
            example: 'gid://shopify/Customer/132134421'
          },
          companyLocationId: {
            type: 'string',
            description: 'Company Location ID',
            example: 'gid://shopify/CompanyLocation/132134421'
          }
        },
        required: ['storeName', 'customerId', 'companyLocationId']
      }
    }
  ],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'Successfully retrieved shopping list aggregation',
      schema: {
        type: 'object',
        properties: {
          summary: {
            type: 'object',
            properties: {
              totalItemCount: {
                type: 'number',
                description: 'Total number of items in the shopping list',
                example: 5
              },
              subtotal: {
                type: 'number',
                description: 'Total price of all items in the shopping list',
                example: 99.99
              },
              currencyCode: {
                type: 'string',
                description: 'Currency code for the prices',
                example: 'USD'
              }
            }
          }
        }
      }
    },
    '400': {
      description: 'Bad Request',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'integer',
            example: 400
          },
          message: {
            type: 'string',
            example: 'Invalid parameters'
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                code: {
                  type: 'string'
                },
                message: {
                  type: 'string'
                },
                path: {
                  type: 'array',
                  items: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      }
    },
    '404': {
      description: 'Shopping list not found',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'integer',
            example: 404
          },
          message: {
            type: 'string',
            example: 'Shopping list not found'
          }
        }
      }
    },
    '500': {
      description: 'Internal Server Error',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'integer',
            example: 500
          },
          message: {
            type: 'string',
            example: 'Internal server error'
          }
        }
      }
    }
  }
}; 