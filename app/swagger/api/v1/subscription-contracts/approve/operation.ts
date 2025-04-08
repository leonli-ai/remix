/**
 * Swagger operation definition for subscription contract approval
 */
export const approveSubscriptionContractOperation = {
  tags: ['Subscription Contracts'],
  summary: 'Approve a subscription contract',
  description: 'Approves a pending subscription contract, changing its status to active and setting the next order creation date.',
  operationId: 'approveSubscriptionContract',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: [
          'storeName',
          'customerId',
          'companyLocationId',
          'subscriptionContractId',
          'approverId',
          'approverName'
        ],
        properties: {
          storeName: {
            type: 'string',
            description: 'Store name in format "store-name.myshopify.com"',
            example: 'b2b-accelerator.myshopify.com'
          },
          customerId: {
            type: 'string',
            description: 'Shopify customer ID',
            example: 'gid://shopify/Customer/778899'
          },
          companyLocationId: {
            type: 'string',
            description: 'Company location ID associated with the subscription',
            example: 'gid://shopify/CompanyLocation/6501466332'
          },
          subscriptionContractId: {
            type: 'number',
            description: 'Subscription contract ID to approve',
            example: 1
          },
          approverId: {
            type: 'string',
            description: 'ID of the approver (company contact ID)',
            example: 'gid://shopify/CompanyContact/778899'
          },
          approverName: {
            type: 'string',
            description: 'Name of the approver',
            example: 'Emma Zhang'
          }
        }
      }
    }
  ],
  security: [{ bearerAuth: [] }],
  responses: {
    "200": {
      description: 'Successful operation',
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the approval operation was successful',
            example: true
          },
          message: {
            type: 'string',
            description: 'Message describing the result of the operation',
            example: 'Subscription approved successfully.'
          },
          nextOrderDate: {
            type: 'string',
            description: 'Next order creation date after approval',
            example: '2024-04-28'
          }
        }
      }
    },
    "400": {
      description: 'Validation error or invalid request',
      schema: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Cannot approve a subscription that is not in pending status. Current status: active'
          },
          status: {
            type: 'number',
            example: 400
          }
        }
      }
    },
    "401": {
      description: 'Unauthorized request',
      schema: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Approver does not have the required permission to approve subscription contracts'
          },
          status: {
            type: 'number',
            example: 401
          }
        }
      }
    },
    "404": {
      description: 'Subscription contract not found',
      schema: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Subscription contract with ID 1 not found'
          },
          status: {
            type: 'number',
            example: 404
          }
        }
      }
    },
    "500": {
      description: 'Internal server error',
      schema: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Failed to approve subscription contract'
          },
          status: {
            type: 'number',
            example: 500
          }
        }
      }
    }
  }
}; 