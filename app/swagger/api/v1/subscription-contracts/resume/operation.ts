export const resumeSubscriptionContractOperation = {
  tags: ['Subscription Contracts'],
  summary: 'Resume a paused subscription contract',
  description: 'Resume a paused subscription contract, returning it to active status. If the nextOrderCreationDate has passed, it will be rescheduled based on the current date and subscription interval.',
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
            description: 'Subscription contract ID to resume',
            example: 1001
          }
        }
      }
    }
  ],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'Successfully resumed subscription contract',
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the resume operation was successful',
            example: true
          },
          message: {
            type: 'string',
            description: 'Message describing the result of the operation',
            example: 'Subscription resumed successfully.'
          },
          subscriptionContractId: {
            type: 'number',
            description: 'ID of the resumed subscription contract',
            example: 1001
          },
          status: {
            type: 'string',
            description: 'New status of the subscription contract',
            example: 'active'
          },
          nextOrderCreationDate: {
            type: 'string',
            format: 'date',
            description: 'Next scheduled order creation date',
            example: '2025-05-10'
          },
          rescheduled: {
            type: 'boolean',
            description: 'Whether the next order creation date was rescheduled',
            example: false
          }
        }
      }
    },
    '400': {
      description: 'Bad Request - Only paused subscriptions can be resumed'
    },
    '401': {
      description: 'Unauthorized'
    },
    '403': {
      description: 'Forbidden'
    },
    '404': {
      description: 'Not Found - Subscription contract not found or no permission to access'
    },
    '500': {
      description: 'Internal Server Error'
    }
  }
}; 