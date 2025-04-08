export const convertQuoteToOrderOperation = {
  tags: ['Quote Management'],
  summary: 'Convert quote to order',
  description: 'Converts a quote to a Shopify draft order. Only quotes in Requested or Approved status can be converted.',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'quoteId', 'companyLocationId', 'customerId'],
        properties: {
          storeName: {
            type: 'string',
            description: 'Name of the store',
            example: 'b2b-accelerator.myshopify.com'
          },
          quoteId: {
            type: 'number',
            description: 'ID of the quote to convert to order',
            example: 123
          },
          companyLocationId: {
            type: 'string',
            description: 'ID of the company location',
            example: 'gid://shopify/CompanyLocation/123456789'
          },
          customerId: {
            type: 'string',
            description: 'ID of the user performing the conversion (will be used as actionBy)',
            example: 'gid://shopify/Customer/123456789'
          },
          note: {
            type: 'string',
            description: 'Optional note for the draft order',
            minLength: 1,
            maxLength: 500,
            example: 'Order created from approved quote'
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Quote converted to order successfully',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'number',
            example: 200
          },
          message: {
            type: 'string',
            example: 'Quote converted to order successfully'
          }
        }
      }
    },
    '400': {
      description: 'Invalid request parameters or quote status',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'number',
            example: 400
          },
          message: {
            type: 'string',
            example: 'Cannot convert quote with status Draft. Only quotes in Requested or Approved status can be converted.'
          }
        }
      }
    },
    '404': {
      description: 'Quote not found',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'number',
            example: 404
          },
          message: {
            type: 'string',
            example: 'Quote not found'
          }
        }
      }
    },
    '500': {
      description: 'Internal server error',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'number',
            example: 500
          },
          message: {
            type: 'string',
            example: 'Failed to convert quote to order'
          }
        }
      }
    }
  }
}; 