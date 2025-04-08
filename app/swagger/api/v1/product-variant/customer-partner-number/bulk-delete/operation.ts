export const bulkDeleteMappingOperation = {
  tags: ['Product Variant'],
  summary: 'Bulk delete store company mappings',
  description: 'Delete multiple store company mappings by IDs for a specific store',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'ids'],
        properties: {
          storeName: {
            type: 'string',
            description: 'Store name',
            example: 'b2b-accelerator.myshopify.com'
          },
          ids: {
            type: 'array',
            items: {
              type: 'number'
            },
            description: 'Array of mapping IDs to delete',
            example: [1, 2, 3]
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Successfully deleted mappings',
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          deletedCount: {
            type: 'number',
            description: 'Number of records deleted',
            example: 3
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
          error: {
            type: 'boolean',
            example: true
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
          error: {
            type: 'boolean',
            example: true
          }
        }
      }
    }
  }
}; 