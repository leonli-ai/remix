export const approveDraftOrderOperation = {
  tags: ['Order Management'],
  summary: 'Approve draft order',
  description: 'Completes a draft order and marks it as approved',
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
            description: 'ID of the draft order to approve',
            example: 'gid://shopify/DraftOrder/123456789'
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Draft order approved successfully',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'number',
            example: 200
          },
          message: {
            type: 'string',
            example: 'Draft order approved successfully'
          },
          data: {
            type: 'object',
            properties: {
              draftOrder: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    description: 'Draft order ID',
                    example: 'gid://shopify/DraftOrder/1210161725660'
                  },
                  status: {
                    type: 'string',
                    description: 'Draft order status',
                    example: 'COMPLETED'
                  },
                  order: {
                    type: 'object',
                    nullable: true,
                    properties: {
                      id: {
                        type: 'string',
                        description: 'Generated order ID',
                        example: 'gid://shopify/Order/6170416677084'
                      }
                    }
                  }
                }
              }
            }
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
            example: 'This order has already been paid'
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