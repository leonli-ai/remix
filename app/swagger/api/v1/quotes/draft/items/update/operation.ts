export const updateDraftQuoteItemsOperation = {
  tags: ['Quote Management'],
  summary: 'Update draft quote items',
  description: 'Update items for draft quotes. This operation replaces all existing items with the new items provided.',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'draftQuoteId', 'companyLocationId', 'customerId', 'draftQuoteItems'],
        properties: {
          storeName: {
            type: 'string',
            description: 'Name of the store',
            example: 'b2b-accelerator.myshopify.com'
          },
          draftQuoteId: {
            type: 'number',
            description: 'ID of the draft quote to update',
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
          draftQuoteItems: {
            type: 'array',
            description: 'New items for the draft quote',
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
      description: 'Draft quote items updated successfully',
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
            example: 'Successfully updated draft quote items'
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
      description: 'Unauthorized to update the draft quote',
      schema: {
        type: 'object',
        properties: {
          code: { type: 'number', example: 403 },
          message: { type: 'string', example: 'Unauthorized to update this draft quote' }
        }
      }
    },
    '404': {
      description: 'Draft quote not found',
      schema: {
        type: 'object',
        properties: {
          code: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Draft quote with ID 123 not found' }
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