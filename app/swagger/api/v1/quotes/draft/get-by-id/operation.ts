export const getDraftQuoteOperation = {
  tags: ['Quote Management'],
  summary: 'Get draft quote details',
  description: 'Retrieves detailed information for a specific draft quote',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'customerId', 'draftQuoteId', 'companyLocationId'],
        properties: {
          storeName: {
            type: 'string',
            description: 'Name of the store',
            example: 'b2b-accelerator.myshopify.com'
          },
          customerId: {
            type: 'string',
            description: 'ID of the customer',
            example: 'gid://shopify/Customer/123456789'
          },
          draftQuoteId: {
            type: 'number',
            description: 'ID of the draft quote to retrieve',
            example: 123
          },
          companyLocationId: {
            type: 'string',
            description: 'ID of the company location',
            example: 'gid://shopify/CompanyLocation/123456789'
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Draft quote details retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            example: 123
          },
          customerId: {
            type: 'string',
            example: 'gid://shopify/Customer/123456789'
          },
          companyLocationId: {
            type: 'string',
            nullable: true,
            example: 'gid://shopify/CompanyLocation/123456789'
          },
          subtotal: {
            type: 'number',
            example: 299.99
          },
          currencyCode: {
            type: 'string',
            example: 'USD'
          },
          status: {
            type: 'string',
            enum: ['Draft', 'Submitted', 'Approved', 'Declined'],
            example: 'Draft'
          },
          additionalNotes: {
            type: 'string',
            nullable: true,
            example: 'Bulk order for Q1 2024'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-18T10:30:00Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-18T10:30:00Z'
          },
          createdBy: {
            type: 'string',
            example: 'gid://shopify/Customer/123456789'
          },
          updatedBy: {
            type: 'string',
            nullable: true,
            example: null
          },
          actionBy: {
            type: 'string',
            nullable: true,
            example: null
          },
          draftQuoteItems: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: {
                  type: 'string',
                  example: 'gid://shopify/Product/123456789'
                },
                variantId: {
                  type: 'string',
                  example: 'gid://shopify/ProductVariant/123456789'
                },
                quantity: {
                  type: 'number',
                  minimum: 1,
                  example: 5
                },
                originalPrice: {
                  type: 'number',
                  minimum: 0,
                  example: 49.99
                },
                offerPrice: {
                  type: 'number',
                  minimum: 0,
                  example: 44.99
                },
                description: {
                  type: 'string',
                  nullable: true,
                  example: 'Bulk discount applied'
                }
              }
            }
          },
          itemCount: {
            type: 'number',
            example: 5
          }
        }
      }
    },
    '400': {
      description: 'Invalid request parameters',
      schema: {
        type: 'object',
        properties: {
          code: { type: 'number', example: 400 },
          message: { type: 'string', example: 'Invalid parameters' }
        }
      }
    },
    '404': {
      description: 'Draft quote not found',
      schema: {
        type: 'object',
        properties: {
          code: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Draft quote not found' }
        }
      }
    },
    '405': {
      description: 'Method not allowed',
      schema: {
        type: 'object',
        properties: {
          code: { type: 'number', example: 405 },
          message: { type: 'string', example: 'Method not allowed' }
        }
      }
    },
    '500': {
      description: 'Internal server error',
      schema: {
        type: 'object',
        properties: {
          code: { type: 'number', example: 500 },
          message: { type: 'string', example: 'Internal server error' }
        }
      }
    }
  }
}; 