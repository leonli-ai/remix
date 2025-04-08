export const rejectDraftOrderOperation = {
  tags: ['Order Management'],
  summary: 'Reject draft order',
  description: 'Marks a draft order as rejected',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'customerId', 'draftOrderId'],
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
          draftOrderId: {
            type: 'string',
            description: 'ID of the draft order to reject',
            example: 'gid://shopify/DraftOrder/123456789'
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Draft order rejected successfully',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'number',
            example: 200
          },
          message: {
            type: 'string',
            example: 'Draft order rejected successfully'
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
            example: 'Failed to reject draft order'
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