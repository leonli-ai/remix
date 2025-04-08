export const deleteSubscriptionContractOperation = {
  tags: ['Subscription Contracts'],
  summary: 'Delete a subscription contract',
  description: 'Delete a subscription contract that is in pending status. Active or paused contracts cannot be deleted.',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'customerId', 'companyLocationId', 'subscriptionContractId'],
        properties: {
          storeName: {
            type: 'string',
            description: 'Store name in format "store-name.myshopify.com"',
            example: 'demo.myshopify.com'
          },
          customerId: {
            type: 'string',
            description: 'Shopify customer ID',
            example: 'gid://shopify/Customer/12345678'
          },
          companyLocationId: {
            type: 'string',
            description: 'Company location ID associated with the subscription',
            example: 'gid://shopify/CompanyLocation/87654321'
          },
          subscriptionContractId: {
            type: 'number',
            description: 'Subscription contract ID to delete',
            example: 1001
          }
        }
      }
    }
  ],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'Successfully deleted subscription contract',
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the deletion was successful',
            example: true
          },
          message: {
            type: 'string',
            description: 'Success message',
            example: 'Subscription contract successfully deleted'
          }
        }
      }
    },
    '400': {
      description: 'Bad Request'
    },
    '401': {
      description: 'Unauthorized'
    },
    '403': {
      description: 'Forbidden'
    },
    '404': {
      description: 'Not Found'
    },
    '500': {
      description: 'Internal Server Error'
    }
  }
}; 