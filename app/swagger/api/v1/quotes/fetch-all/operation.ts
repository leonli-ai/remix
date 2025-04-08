export const fetchQuotesOperation = {
  tags: ['Quote Management'],
  summary: 'Fetch all non-draft quotes',
  description: 'Retrieves a paginated list of non-draft quotes with filtering and sorting capabilities',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName'],
        properties: {
          storeName: {
            type: 'string',
            description: 'Name of the store',
            example: 'b2b-accelerator.myshopify.com'
          },
          companyLocationId: {
            type: 'string',
            description: 'ID of the company location. If not provided, quotes from all company locations will be returned',
            example: 'gid://shopify/CompanyLocation/123456789'
          },
          pagination: {
            type: 'object',
            properties: {
              page: {
                type: 'number',
                description: 'Page number',
                minimum: 1,
                default: 1,
                example: 1
              },
              pageSize: {
                type: 'number',
                description: 'Number of items per page',
                minimum: 1,
                maximum: 100,
                default: 10,
                example: 10
              }
            }
          },
          filter: {
            type: 'object',
            properties: {
              id: {
                type: 'number',
                description: 'Filter by quote ID (exact match)',
                example: 12345
              },
              customer: {
                type: 'string',
                description: 'Search for customers by name, email, or other identifying information',
                example: 'john.doe@example.com'
              },
              customerIds: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'Filter by specific customer IDs (exact match)',
                example: ['gid://shopify/Customer/123456789', 'gid://shopify/Customer/987654321']
              },
              status: {
                type: 'string',
                enum: ['Submitted', 'Approved', 'Declined', 'Ordered'],
                description: 'Filter by quote status (excluding Draft status)'
              },
              customerId: {
                type: 'string',
                description: 'Filter by customer ID (case-insensitive contains)',
                example: 'gid://shopify/Customer/123456789'
              },
              companyLocationId: {
                type: 'string',
                description: 'Filter by company location ID (case-insensitive contains)',
                example: 'gid://shopify/CompanyLocation/123456789'
              },
              currencyCode: {
                type: 'string',
                description: 'Filter by currency code (case-insensitive equals)',
                example: 'USD'
              },
              createdBy: {
                type: 'string',
                description: 'Filter by creator ID (case-insensitive contains)',
                example: 'gid://shopify/Customer/123456789'
              },
              updatedBy: {
                type: 'string',
                description: 'Filter by updater ID (case-insensitive contains)',
                example: 'gid://shopify/Customer/123456789'
              },
              actionBy: {
                type: 'string',
                description: 'Filter by action performer ID (case-insensitive contains)',
                example: 'gid://shopify/Customer/123456789'
              },
              poNumber: {
                type: 'string',
                description: 'Filter by purchase order number (case-insensitive contains)',
                example: 'PO-12345'
              },
              createdAt: {
                type: 'string',
                description: 'Filter by creation date (>= comparison, YYYY-MM-DD format)',
                pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                example: '2024-01-01'
              },
              updatedAt: {
                type: 'string',
                description: 'Filter by update date (>= comparison, YYYY-MM-DD format)',
                pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                example: '2024-01-01'
              },
              expirationDate: {
                type: 'string',
                description: 'Filter by expiration date (YYYY-MM-DD format)',
                pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                example: '2025-03-13'
              }
            }
          },
          sort: {
            type: 'array',
            description: 'Sorting criteria',
            items: {
              type: 'object',
              required: ['field', 'order'],
              properties: {
                field: {
                  type: 'string',
                  enum: [
                    'id',
                    'customerId',
                    'companyLocationId',
                    'subtotal',
                    'currencyCode',
                    'createdAt',
                    'updatedAt',
                    'createdBy',
                    'updatedBy'
                  ],
                  description: 'Field to sort by'
                },
                order: {
                  type: 'string',
                  enum: ['asc', 'desc'],
                  default: 'desc',
                  description: 'Sort order'
                }
              }
            },
            default: [{ field: 'createdAt', order: 'desc' }]
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Successfully retrieved quotes',
      schema: {
        type: 'object',
        properties: {
          page: {
            type: 'number',
            example: 1
          },
          pageSize: {
            type: 'number',
            example: 10
          },
          totalCount: {
            type: 'number',
            example: 50
          },
          quotes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  example: 1
                },
                storeName: {
                  type: 'string',
                  example: 'b2b-accelerator.myshopify.com'
                },
                status: {
                  type: 'string',
                  enum: ['Submitted', 'Approved', 'Declined', 'Ordered'],
                  example: 'Submitted'
                },
                subtotal: {
                  type: 'number',
                  example: 449.95
                },
                currencyCode: {
                  type: 'string',
                  example: 'USD'
                },
                poNumber: {
                  type: 'string',
                  nullable: true,
                  example: null
                },
                createdAt: {
                  type: 'string',
                  format: 'date-time',
                  example: '2025-03-03T02:35:49.064Z'
                },
                updatedAt: {
                  type: 'string',
                  format: 'date-time',
                  example: '2025-03-03T02:35:49.064Z'
                },
                createdBy: {
                  type: 'string',
                  example: 'gid://shopify/Customer/7840260948188'
                },
                updatedBy: {
                  type: 'string',
                  nullable: true,
                  example: null
                },
                actionBy: {
                  type: 'string',
                  nullable: true,
                  example: null
                },
                quoteItems: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'number',
                        example: 1
                      },
                      quoteId: {
                        type: 'number',
                        example: 1
                      },
                      productId: {
                        type: 'string',
                        example: 'gid://shopify/Product/8871748370652'
                      },
                      variantId: {
                        type: 'string',
                        example: 'gid://shopify/ProductVariant/46180159062236'
                      },
                      quantity: {
                        type: 'number',
                        minimum: 1,
                        example: 5
                      },
                      originalPrice: {
                        type: 'number',
                        minimum: 0,
                        example: 99.99
                      },
                      offerPrice: {
                        type: 'number',
                        minimum: 0,
                        example: 89.99
                      },
                      description: {
                        type: 'string',
                        nullable: true,
                        example: 'Bulk order discount applied'
                      },
                      createdAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2025-03-03T02:35:49.064Z'
                      },
                      updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2025-03-03T02:35:49.064Z'
                      }
                    }
                  }
                },
                notes: {
                  type: 'array',
                  description: 'History of quote notes',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'number',
                        example: 1
                      },
                      quoteId: {
                        type: 'number',
                        example: 123
                      },
                      noteType: {
                        type: 'string',
                        enum: ['submitted', 'approved', 'declined'],
                        example: 'submitted'
                      },
                      noteContent: {
                        type: 'string',
                        example: 'Initial quote request submitted'
                      },
                      createdBy: {
                        type: 'string',
                        example: 'gid://shopify/Customer/123456789'
                      },
                      createdAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2024-01-18T10:30:00Z'
                      },
                      updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2024-01-18T10:30:00Z'
                      }
                    }
                  }
                },
                itemCount: {
                  type: 'number',
                  example: 1
                },
                customer: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      example: 'gid://shopify/Customer/7840260948188'
                    },
                    firstName: {
                      type: 'string',
                      example: 'jameszhou'
                    },
                    lastName: {
                      type: 'string',
                      example: ''
                    },
                    email: {
                      type: 'string',
                      example: 'jameszhou@aaxis.io'
                    },
                    phone: {
                      type: 'string',
                      nullable: true,
                      example: null
                    },
                    state: {
                      type: 'string',
                      example: 'DISABLED'
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
      description: 'Invalid request parameters',
      schema: {
        type: 'object',
        properties: {
          code: { type: 'number', example: 400 },
          message: { type: 'string', example: 'Invalid parameters' }
        }
      }
    },
    '405': {
      description: 'Method not allowed',
      schema: {
        type: 'object',
        properties: {
          code: { type: 'number', example: 405 },
          message: { type: 'string', example: 'Method not allowed' }
        }
      }
    },
    '500': {
      description: 'Internal server error',
      schema: {
        type: 'object',
        properties: {
          code: { type: 'number', example: 500 },
          message: { type: 'string', example: 'Internal server error' }
        }
      }
    }
  }
}; 