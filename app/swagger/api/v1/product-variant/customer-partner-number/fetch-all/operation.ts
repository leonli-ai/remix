export const fetchAllStoreCompanyMappingOperation = {
  tags: ['Product Variant'],
  summary: 'Fetch all store company mappings with pagination and filters',
  description: 'Retrieve store company mappings with support for filtering and sorting',
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
            description: 'Store name',
            example: 'b2b-accelerator.myshopify.com'
          },
          pagination: {
            type: 'object',
            required: false,
            properties: {
              page: {
                type: 'number',
                description: 'Page number',
                default: 1
              },
              pageSize: {
                type: 'number',
                description: 'Number of items per page',
                default: 10
              }
            }
          },
          filter: {
            type: 'object',
            required: false,
            properties: {
              skuId: {
                type: 'string',
                description: 'Filter by SKU ID'
              },
              customerPartnerNumber: {
                type: 'string',
                description: 'Filter by customer partner number'
              },
              productTitle: {
                type: 'string',
                description: 'Filter by product title'
              },
              companyId: {
                type: 'string',
                description: 'Filter by company ID',
                example: 'gid://shopify/Company/123456'
              },
              companyName: {
                type: 'string',
                description: 'Filter by company name (case-insensitive)',
                example: 'Example Company'
              }
            }
          },
          sort: {
            oneOf: [
              {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    field: {
                      type: 'string',
                      enum: [
                        'id',
                        'storeName',
                        'skuId',
                        'companyId',
                        'companyName',
                        'customerPartnerNumber',
                        'productTitle',
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
                      description: 'Sort order',
                      default: 'asc'
                    }
                  }
                },
                description: 'New format: Array of sort criteria',
                default: [
                  { field: 'companyName', order: 'asc' },
                  { field: 'skuId', order: 'asc' }
                ]
              },
              {
                type: 'object',
                description: 'Legacy format: Single sort criterion',
                properties: {
                  sortBy: {
                    type: 'string',
                    enum: [
                      'id',
                      'storeName',
                      'skuId',
                      'companyId',
                      'companyName',
                      'customerPartnerNumber',
                      'productTitle',
                      'createdAt',
                      'updatedAt',
                      'createdBy',
                      'updatedBy'
                    ],
                    description: 'Field to sort by',
                    default: 'createdAt'
                  },
                  sortOrder: {
                    type: 'string',
                    enum: ['asc', 'desc'],
                    description: 'Sort order',
                    default: 'desc'
                  }
                }
              }
            ]
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Successfully retrieved store company mappings',
      schema: {
        type: 'object',
        properties: {
          page: {
            type: 'number',
            description: 'Current page number'
          },
          pageSize: {
            type: 'number',
            description: 'Number of items per page'
          },
          totalCount: {
            type: 'number',
            description: 'Total number of records'
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Record ID'
                },
                storeName: {
                  type: 'string',
                  description: 'Store name'
                },
                skuId: {
                  type: 'string',
                  description: 'SKU ID'
                },
                companyId: {
                  type: 'string',
                  description: 'Company ID'
                },
                companyName: {
                  type: 'string',
                  description: 'Company name',
                  nullable: true
                },
                customerPartnerNumber: {
                  type: 'string',
                  description: 'Customer partner number'
                },
                productTitle: {
                  type: 'string',
                  description: 'Product title',
                  nullable: true
                },
                createdAt: {
                  type: 'string',
                  description: 'Creation timestamp'
                },
                updatedAt: {
                  type: 'string',
                  description: 'Last update timestamp'
                },
                createdBy: {
                  type: 'string',
                  description: 'Creator ID',
                  nullable: true
                },
                updatedBy: {
                  type: 'string',
                  description: 'Last updater ID',
                  nullable: true
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
          message: {
            type: 'string',
            example: 'Invalid parameters'
          },
          error: {
            type: 'boolean',
            example: true
          }
        }
      }
    },
    '500': {
      description: 'Internal server error',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Internal server error'
          },
          error: {
            type: 'boolean',
            example: true
          }
        }
      }
    }
  }
}; 