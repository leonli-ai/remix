export const skipSubscriptionContractOperation = {
  tags: ['Subscription Contracts'],
  summary: 'Skip the current subscription cycle',
  description: 'Skip the current subscription cycle and move the next order creation date to the next billing cycle. This operation is only allowed for active subscriptions and before the next order creation date.',
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
            description: 'Subscription contract ID to skip',
            example: 1001
          }
        }
      }
    }
  ],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'Successfully skipped subscription cycle',
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the skip operation was successful',
            example: true
          },
          message: {
            type: 'string',
            description: 'Message describing the result of the operation',
            example: 'Subscription skipped. Next delivery moved to 2024-06-01.'
          },
          nextOrderCreationDate: {
            type: 'string',
            format: 'date-time',
            description: 'New next order creation date after skipping',
            example: '2024-06-01T00:00:00.000Z'
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