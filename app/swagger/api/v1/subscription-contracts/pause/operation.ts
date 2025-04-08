export const pauseSubscriptionContractOperation = {
  tags: ['Subscription Contracts'],
  summary: 'Pause a subscription contract',
  description: 'Pause an active subscription contract. This will maintain the next order creation date, but suspend the subscription until it is reactivated.',
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
            description: 'Subscription contract ID to pause',
            example: 1001
          }
        }
      }
    }
  ],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'Successfully paused subscription contract',
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the pause operation was successful',
            example: true
          },
          message: {
            type: 'string',
            description: 'Message describing the result of the operation',
            example: 'Subscription contract paused successfully'
          },
          subscriptionContractId: {
            type: 'number',
            description: 'ID of the paused subscription contract',
            example: 1001
          },
          status: {
            type: 'string',
            description: 'New status of the subscription contract',
            example: 'paused'
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