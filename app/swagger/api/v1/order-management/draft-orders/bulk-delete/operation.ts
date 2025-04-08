export const bulkDeleteDraftOrdersOperation = {
  tags: ['Order Management'],
  summary: 'Bulk delete draft orders',
  description: 'Delete multiple draft orders by IDs or search criteria',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'customerId'],
        properties: {
          storeName: {
            type: 'string',
            description: 'Name of the store',
            example: 'b2b-accelerator.myshopify.com'
          },
          customerId: {
            type: 'string',
            description: 'ID of the customer performing the action',
            example: 'gid://shopify/Customer/123456789'
          },
          ids: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Array of draft order IDs to delete',
            example: ['gid://shopify/DraftOrder/123', 'gid://shopify/DraftOrder/456']
          },
          search: {
            type: 'string',
            description: 'Search query to filter draft orders for deletion',
            example: 'status:OPEN'
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Draft orders deletion initiated successfully',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'number',
            example: 200
          },
          message: {
            type: 'string',
            example: 'Draft orders deletion initiated successfully'
          }
        }
      }
    },
    '400': {
      description: 'Bad request or business logic error',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'number',
            example: 400
          },
          message: {
            type: 'string',
            example: 'Failed to bulk delete draft orders'
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
            example: 'Internal server error'
          }
        }
      }
    }
  }
}; 