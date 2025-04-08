export const fetchListOperation = {
  tags: ['Shopping-List'],
  summary: 'Fetch all shopping lists',
  description: 'Retrieve a list of all shopping lists with support for filtering, sorting, and pagination.',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        properties: {
          storeName: {
            type: 'string',
            description: 'Store name',
            example: 'acme-store.myshopify.com'
          },
          customerId: {
            type: 'string',
            description: 'Customer ID',
            example: 'gid://shopify/Customer/132134421'
          },
          companyLocationId: {
            type: 'string',
            description: 'Company Location ID',
            example: 'gid://shopify/CompanyLocation/132134421'
          },
          data: {
            type: 'object',
            properties: {
              filters: {
                type: 'object',
                properties: {
                  id: {
                    type: 'number',
                    description: 'Filter by shopping list ID'
                  },
                  customerId: {
                    type: 'string',
                    description: 'Filter by customer ID'
                  },
                  groupId: {
                    type: 'number',
                    description: 'Filter by group ID'
                  },
                  name: {
                    type: 'string',
                    description: 'Filter by shopping list name (case-insensitive)'
                  },
                  description: {
                    type: 'string',
                    description: 'Filter by description (case-insensitive)'
                  },
                  companyLocationId: {
                    type: 'string',
                    description: 'Filter by company location ID'
                  },
                  isDefault: {
                    type: 'boolean',
                    description: 'Filter by default status'
                  },
                  canEdit: {
                    type: 'boolean',
                    description: 'Filter by edit permission'
                  },
                  createBy: {
                    type: 'string',
                    description: 'Filter by creator ID'
                  },
                  updateBy: {
                    type: 'string',
                    description: 'Filter by last updater ID'
                  },
                  createdAt: {
                    type: 'string',
                    description: 'Filter by creation date (ISO format)',
                    example: '2024-01-01T00:00:00Z'
                  },
                  updatedAt: {
                    type: 'string',
                    description: 'Filter by last update date (ISO format)',
                    example: '2024-01-01T00:00:00Z'
                  }
                }
              },
              pagination: {
                type: 'object',
                properties: {
                  page: {
                    type: 'integer',
                    description: 'Page number for pagination',
                    default: 1
                  },
                  pageSize: {
                    type: 'integer',
                    description: 'Number of items per page',
                    default: 10
                  }
                }
              },
              sort: {
                type: 'array',
                description: 'Sorting criteria',
                items: {
                  type: 'object',
                  properties: {
                    field: {
                      type: 'string',
                      enum: [
                        'id',
                        'customerId',
                        'groupId',
                        'name',
                        'description',
                        'companyLocationId',
                        'isDefault',
                        'canEdit',
                        'createBy',
                        'updateBy',
                        'createdAt',
                        'updatedAt'
                      ],
                      description: 'Field to sort by'
                    },
                    order: {
                      type: 'string',
                      enum: ['asc', 'desc'],
                      default: 'asc',
                      description: 'Sort order'
                    }
                  }
                },
                default: [{ field: 'updatedAt', order: 'desc' }]
              },
              currencyCode: {
                type: 'string',
                description: 'Currency code for price calculations',
                example: 'USD'
              }
            }
          }
        },
        required: ['storeName', 'customerId', 'companyLocationId']
      }
    }
  ],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'Successfully fetched shopping lists',
      schema: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            description: 'Current page number',
            example: 1
          },
          pageSize: {
            type: 'integer',
            description: 'Number of items per page',
            example: 10
          },
          totalCount: {
            type: 'integer',
            description: 'Total number of items',
            example: 1
          },
          shoppingLists: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                  description: 'Shopping list ID'
                },
                customerId: {
                  type: 'string',
                  description: 'Customer ID'
                },
                groupId: {
                  type: 'integer',
                  description: 'Group ID',
                  nullable: true
                },
                companyLocationId: {
                  type: 'string',
                  description: 'Company location ID'
                },
                name: {
                  type: 'string',
                  description: 'Shopping list name'
                },
                description: {
                  type: 'string',
                  description: 'Shopping list description',
                  nullable: true
                },
                isDefault: {
                  type: 'boolean',
                  description: 'Whether this is the default list',
                  default: false
                },
                canEdit: {
                  type: 'boolean',
                  description: 'Whether the list can be edited',
                  default: true
                },
                createBy: {
                  type: 'string',
                  description: 'Creator ID',
                  nullable: true
                },
                updateBy: {
                  type: 'string',
                  description: 'Last updater ID',
                  nullable: true
                },
                subtotal: {
                  type: 'number',
                  description: 'Shopping list subtotal',
                  nullable: true
                },
                currencyCode: {
                  type: 'string',
                  description: 'Currency code',
                  example: 'USD',
                  nullable: true
                },
                items: {
                  type: 'integer',
                  description: 'Number of items in the list',
                  nullable: true
                },
                createdAt: {
                  type: 'string',
                  description: 'Creation timestamp',
                  format: 'date-time'
                },
                updatedAt: {
                  type: 'string',
                  description: 'Last update timestamp',
                  format: 'date-time'
                }
              }
            }
          }
        }
      }
    },
    '400': {
      description: 'Bad Request - Invalid parameters',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Invalid parameters provided'
          },
          errors: {
            type: 'array',
            items: {
              type: 'string'
            },
            example: ['Invalid sort field', 'Invalid filter value']
          }
        }
      }
    },
    '401': {
      description: 'Unauthorized - Authentication required'
    },
    '403': {
      description: 'Forbidden - Insufficient permissions'
    },
    '500': {
      description: 'Internal Server Error',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Internal server error occurred'
          }
        }
      }
    }
  }
}; 