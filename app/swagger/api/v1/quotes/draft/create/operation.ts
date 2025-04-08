export const createDraftQuoteOperation = {
  tags: ['Quote Management'],
  summary: 'Create a new draft quote',
  description: 'Creates a new draft quote with the provided details',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'draftQuote'],
        properties: {
          storeName: {
            type: 'string',
            description: 'Name of the store',
            example: 'b2b-accelerator.myshopify.com'
          },
          draftQuote: {
            type: 'object',
            required: ['customerId', 'draftQuoteItems'],
            properties: {
              customerId: {
                type: 'string',
                description: 'ID of the customer creating the quote',
                example: 'gid://shopify/Customer/123456789'
              },
              companyLocationId: {
                type: 'string',
                nullable: true,
                description: 'ID of the company location',
                example: 'gid://shopify/CompanyLocation/123456789'
              },
              currencyCode: {
                type: 'string',
                description: 'Currency code for the quote',
                default: 'USD',
                example: 'USD'
              },
              additionalNotes: {
                type: 'string',
                nullable: true,
                description: 'Additional notes for the quote',
                example: 'Bulk order for Q1 2024'
              },
              draftQuoteItems: {
                type: 'array',
                description: 'List of items in the quote',
                minItems: 1,
                items: {
                  type: 'object',
                  required: ['productId', 'variantId', 'quantity', 'originalPrice', 'offerPrice'],
                  properties: {
                    productId: {
                      type: 'string',
                      description: 'ID of the product',
                      example: 'gid://shopify/Product/123456789'
                    },
                    variantId: {
                      type: 'string',
                      description: 'ID of the product variant',
                      example: 'gid://shopify/ProductVariant/123456789'
                    },
                    quantity: {
                      type: 'number',
                      description: 'Quantity of the item',
                      minimum: 1,
                      example: 5
                    },
                    originalPrice: {
                      type: 'number',
                      description: 'Original price of the item',
                      minimum: 0,
                      example: 49.99
                    },
                    offerPrice: {
                      type: 'number',
                      description: 'Offered price for the item',
                      minimum: 0,
                      example: 44.99
                    },
                    description: {
                      type: 'string',
                      nullable: true,
                      description: 'Description for the quote item',
                      example: 'Bulk discount applied'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  ],
  responses: {
    '201': {
      description: 'Draft quote created successfully',
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