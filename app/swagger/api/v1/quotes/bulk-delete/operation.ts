export const bulkDeleteQuotesOperation = {
  tags: ['Quote Management'],
  summary: 'Bulk delete quotes',
  description: 'Delete multiple quotes (both draft and non-draft) in a single operation. Only the owner of the quotes can delete them.',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'companyLocationId', 'customerId', 'quoteIds'],
        properties: {
          storeName: {
            type: 'string',
            description: 'Name of the store',
            example: 'b2b-accelerator.myshopify.com'
          },
          companyLocationId: {
            type: 'string',
            description: 'ID of the company location',
            example: 'gid://shopify/CompanyLocation/123456789'
          },
          customerId: {
            type: 'string',
            description: 'ID of the customer who owns the quotes',
            example: 'gid://shopify/Customer/123456789'
          },
          quoteIds: {
            type: 'array',
            description: 'Array of quote IDs to delete',
            minItems: 1,
            items: {
              type: 'number'
            },
            example: [123, 124, 125]
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Quotes deleted successfully',
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
            example: 'Successfully deleted quotes'
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
          message: { type: 'string', example: 'At least one quote ID must be provided' }
        }
      }
    },
    '403': {
      description: 'Unauthorized to delete one or more quotes',
      schema: {
        type: 'object',
        properties: {
          code: { type: 'number', example: 403 },
          message: { type: 'string', example: 'Unauthorized to delete quotes with IDs 123, 124' }
        }
      }
    },
    '404': {
      description: 'One or more quotes not found',
      schema: {
        type: 'object',
        properties: {
          code: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Quotes with IDs 123, 124 not found' }
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