export const fetchSubscriptionContractsOperation = {
  tags: ['Subscription Contracts'],
  summary: 'Fetch all subscription contracts',
  description: 'Fetch all subscription contracts with filtering and pagination',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'companyLocationId', 'pagination'],
        properties: {
          storeName: {
            type: 'string',
            description: 'Store name',
            example: 'demo.myshopify.com'
          },
          companyId: {
            type: 'string',
            description: 'Company ID (optional)',
            example: 'gid://shopify/Company/123'
          },
          companyLocationId: {
            type: 'string',
            description: 'Company location ID',
            example: 'gid://shopify/CompanyLocation/456'
          },
          filter: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Filter by name (fuzzy match)',
                example: 'Pipe'
              },
              status: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['active', 'paused', 'cancelled', 'pending', 'completed', 'declined']
                },
                description: 'Filter by status',
                example: ['active', 'paused']
              },
              approvedByName: {
                type: 'string',
                description: 'Filter by approver name (fuzzy match)',
                example: 'Susan'
              },
              startDateFrom: {
                type: 'string',
                format: 'date',
                description: 'Filter by start date from',
                example: '2024-01-01'
              },
              startDateTo: {
                type: 'string',
                format: 'date',
                description: 'Filter by start date to',
                example: '2025-01-01'
              },
              frequencyUnit: {
                type: 'string',
                description: 'Filter by frequency unit',
                example: 'months'
              },
              frequencyValue: {
                type: 'number',
                description: 'Filter by frequency value',
                example: 2
              },
              poNumber: {
                type: 'string',
                description: 'Filter by purchase order number (fuzzy match)',
                example: 'PO-12345'
              },
              orderNumber: {
                type: 'string',
                description: 'Filter by order number (fuzzy match)',
                example: '1'
              },
              orderTotalMin: {
                type: 'number',
                description: 'Filter by minimum order total',
                example: 100
              },
              orderTotalMax: {
                type: 'number',
                description: 'Filter by maximum order total',
                example: 500
              },
              nextOrderCreationDateFrom: {
                type: 'string',
                format: 'date',
                description: 'Filter by next order creation date from',
                example: '2024-01-01'
              },
              nextOrderCreationDateTo: {
                type: 'string',
                format: 'date',
                description: 'Filter by next order creation date to',
                example: '2025-01-01'
              }
            }
          },
          pagination: {
            type: 'object',
            required: ['page', 'pageSize'],
            properties: {
              page: {
                type: 'number',
                minimum: 1,
                description: 'Page number',
                example: 1
              },
              pageSize: {
                type: 'number',
                minimum: 1,
                maximum: 100,
                description: 'Page size',
                example: 12
              }
            }
          },
          sort: {
            type: 'object',
            properties: {
              field: {
                type: 'string',
                enum: ['nextOrderCreationDate', 'createdAt', 'name', 'status', 'orderTotal'],
                description: 'Sort field',
                example: 'nextOrderCreationDate'
              },
              order: {
                type: 'string',
                enum: ['asc', 'desc'],
                description: 'Sort order',
                example: 'desc'
              }
            }
          }
        }
      }
    }
  ],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'Successfully fetched subscription contracts',
      schema: {
        type: 'object',
        properties: {
          total: {
            type: 'number',
            description: 'Total number of subscription contracts',
            example: 44
          },
          page: {
            type: 'number',
            description: 'Current page number',
            example: 1
          },
          pageSize: {
            type: 'number',
            description: 'Number of items per page',
            example: 12
          },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Subscription contract ID',
                  example: 1109
                },
                name: {
                  type: 'string',
                  description: 'Subscription contract name',
                  example: 'Plumbing Supplies'
                },
                status: {
                  type: 'string',
                  enum: ['active', 'paused', 'cancelled', 'pending', 'completed', 'declined'],
                  description: 'Subscription contract status',
                  example: 'active'
                },
                orderTotal: {
                  type: 'number',
                  description: 'Total order amount',
                  example: 420.00
                },
                currencyCode: {
                  type: 'string',
                  description: 'Currency code',
                  example: 'USD'
                },
                intervalValue: {
                  type: 'number',
                  description: 'Frequency value',
                  example: 2
                },
                intervalUnit: {
                  type: 'string',
                  description: 'Frequency unit',
                  example: 'months'
                },
                nextOrderCreationDate: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Next order creation date',
                  example: '2024-12-16'
                },
                approvedByName: {
                  type: 'string',
                  description: 'Name of the approver',
                  example: 'Susan Burns'
                },
                poNumber: {
                  type: 'string',
                  description: 'Purchase order number',
                  example: 'PO-12345'
                }
              }
            }
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