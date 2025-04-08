export const fetchDraftQuotesOperation = {
  tags: ['Quote Management'],
  summary: 'Fetch all draft quotes',
  description: 'Retrieves a paginated list of draft quotes with filtering and sorting capabilities',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'companyLocationId'],
        properties: {
          storeName: {
            type: 'string',
            description: 'Name of the store',
            example: 'b2b-accelerator.myshopify.com'
          },
          companyLocationId: {
            type: 'string',
            description: 'ID of the company location',
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
              additionalNotes: {
                type: 'string',
                description: 'Filter by additional notes (case-insensitive contains)',
                example: 'Bulk order'
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
      description: 'Successfully retrieved draft quotes',
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
          draftQuotes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  example: 123
                },
                customerId: {
                  type: 'string',
                  example: 'gid://shopify/Customer/123456789'
                },
                companyLocationId: {
                  type: 'string',
                  nullable: true,
                  example: 'gid://shopify/CompanyLocation/123456789'
                },
                subtotal: {
                  type: 'number',
                  example: 299.99
                },
                currencyCode: {
                  type: 'string',
                  example: 'USD'
                },
                status: {
                  type: 'string',
                  enum: ['Draft', 'Submitted', 'Approved', 'Declined'],
                  example: 'Draft'
                },
                additionalNotes: {
                  type: 'string',
                  nullable: true,
                  example: 'Bulk order for Q1'
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
                },
                createdBy: {
                  type: 'string',
                  example: 'gid://shopify/Customer/123456789'
                },
                updatedBy: {
                  type: 'string',
                  nullable: true,
                  example: 'gid://shopify/Customer/123456789'
                },
                actionBy: {
                  type: 'string',
                  nullable: true,
                  example: 'gid://shopify/Customer/123456789'
                },
                draftQuoteItems: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      productId: {
                        type: 'string',
                        example: 'gid://shopify/Product/123456789'
                      },
                      variantId: {
                        type: 'string',
                        example: 'gid://shopify/ProductVariant/123456789'
                      },
                      quantity: {
                        type: 'number',
                        minimum: 1,
                        example: 5
                      },
                      originalPrice: {
                        type: 'number',
                        minimum: 0,
                        example: 49.99
                      },
                      offerPrice: {
                        type: 'number',
                        minimum: 0,
                        example: 44.99
                      },
                      description: {
                        type: 'string',
                        nullable: true,
                        example: 'Bulk discount applied'
                      }
                    }
                  }
                },
                itemCount: {
                  type: 'number',
                  example: 5
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