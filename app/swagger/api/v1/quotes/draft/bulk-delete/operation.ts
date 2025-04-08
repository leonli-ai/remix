export const bulkDeleteDraftQuotesOperation = {
  tags: ['Quote Management'],
  summary: 'Bulk delete draft quotes',
  description: 'Delete multiple draft quotes in a single operation. Only the owner of the quotes can delete them.',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'companyLocationId', 'customerId', 'draftQuoteIds'],
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
          draftQuoteIds: {
            type: 'array',
            description: 'Array of draft quote IDs to delete',
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
      description: 'Draft quotes deleted successfully',
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
            example: 'Successfully deleted draft quotes'
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
          message: { type: 'string', example: 'At least one draft quote ID must be provided' }
        }
      }
    },
    '403': {
      description: 'Unauthorized to delete one or more draft quotes',
      schema: {
        type: 'object',
        properties: {
          code: { type: 'number', example: 403 },
          message: { type: 'string', example: 'Unauthorized to delete draft quotes with IDs 123, 124' }
        }
      }
    },
    '404': {
      description: 'One or more draft quotes not found',
      schema: {
        type: 'object',
        properties: {
          code: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Draft quotes with IDs 123, 124 not found' }
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