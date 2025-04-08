export const updateQuoteItemsOperation = {
  tags: ['Quote Management'],
  summary: 'Update quote items',
  description: 'Update items for both draft and non-draft quotes. This operation replaces all existing items with the new items provided.',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'quoteId', 'companyLocationId', 'customerId', 'quoteItems'],
        properties: {
          storeName: {
            type: 'string',
            description: 'Name of the store',
            example: 'b2b-accelerator.myshopify.com'
          },
          quoteId: {
            type: 'number',
            description: 'ID of the quote to update',
            example: 123
          },
          companyLocationId: {
            type: 'string',
            description: 'ID of the company location',
            example: 'gid://shopify/CompanyLocation/123456789'
          },
          customerId: {
            type: 'string',
            description: 'ID of the customer who owns the quote',
            example: 'gid://shopify/Customer/123456789'
          },
          expirationDate: {
            type: 'string',
            format: 'date-time',
            description: 'Expiration date',
            example: '2025-03-13T02:24:28.687Z'
          },
          poNumber: {
            type: 'string',
            description: 'PO number',
            example: '123456789'
          },
          note: { 
            type: 'object',
            description: 'Note',
            properties: {
              id: { type: 'number', example: 123 },
              content: { type: 'string', example: 'Note content' }
            }
          },
          quoteItems: {
            type: 'array',
            description: 'New items for the quote',
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
                  description: 'Offer price of the item',
                  minimum: 0,
                  example: 44.99
                },
                description: {
                  type: 'string',
                  description: 'Optional description for the item',
                  nullable: true,
                  example: 'Bulk discount applied'
                }
              }
            }
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Quote items updated successfully',
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the operation was successful',
            example: true
          },
          message: {
            type: 'string',
            description: 'Success message',
            example: 'Successfully updated quote items'
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
          message: { type: 'string', example: 'Invalid parameters provided' }
        }
      }
    },
    '403': {
      description: 'Unauthorized to update the quote',
      schema: {
        type: 'object',
        properties: {
          code: { type: 'number', example: 403 },
          message: { type: 'string', example: 'Unauthorized to update this quote' }
        }
      }
    },
    '404': {
      description: 'Quote not found',
      schema: {
        type: 'object',
        properties: {
          code: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Quote with ID 123 not found' }
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