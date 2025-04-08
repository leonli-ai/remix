export const fetchListByIdOperation = {
  tags: ['Shopping-List'],
  summary: 'Fetch shopping list items by shopping list id',
  description: 'Retrieve a shopping list items by shopping list id with pagination, filtering and sorting support.',
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      type: 'string',
      description: 'Shopping list ID'
    },
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
          filters: {
            type: 'object',
            properties: {
              productName: {
                type: 'string',
                description: 'Filter by product name (case-insensitive partial match)',
                example: 'shirt'
              },
              skuId: {
                type: 'string',
                description: 'Filter by SKU ID (case-insensitive partial match)',
                example: 'SKU123'
              },
              customerPartnerNumber: {
                type: 'string',
                description: 'Filter by customer partner number (case-insensitive partial match)',
                example: 'CPN123'
              }
            }
          },
          sort: {
            type: 'array',
            description: 'Sorting options',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                  enum: ['createdAt', 'productName', 'skuId', 'customerPartnerNumber', 'quantity', 'price'],
                  description: 'Field to sort by'
                },
                order: {
                  type: 'string',
                  enum: ['asc', 'desc'],
                  description: 'Sort order'
                }
              }
            },
            default: [{ field: 'createdAt', order: 'desc' }]
          }
        },
        required: ['storeName', 'customerId', 'companyLocationId']
      }
    }
  ],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'Successfully fetched shopping list items',
      schema: {
        type: 'object',
        properties: {
          shoppingList: {
            type: 'object',
            properties: {
              page: {
                type: 'integer',
                description: 'Current page number',
                example: 1
              },
              pageSize: {
                type: 'integer',
                description: 'Items per page',
                example: 10
              },
              totalCount: {
                type: 'integer',
                description: 'Total number of items',
                example: 100
              },
              shoppingListId: {
                type: 'integer',
                description: 'Shopping list ID',
                example: 1
              },
              name: {
                type: 'string',
                description: 'Shopping list name',
                example: 'My Shopping List'
              },
              description: {
                type: 'string',
                description: 'Shopping list description',
                example: 'List description'
              },
              listItems: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                      description: 'Shopping list item ID'
                    },
                    productId: {
                      type: 'string',
                      description: 'Product ID'
                    },
                    productName: {
                      type: 'string',
                      description: 'Product name'
                    },
                    skuId: {
                      type: 'string',
                      description: 'SKU ID'
                    },
                    productVariantId: {
                      type: 'string',
                      description: 'Product variant ID'
                    },
                    productImageUrl: {
                      type: 'string',
                      description: 'Product image URL'
                    },
                    url: {
                      type: 'string',
                      description: 'Product URL'
                    },
                    customerPartnerNumber: {
                      type: 'string',
                      description: 'Customer partner number'
                    },
                    quantity: {
                      type: 'integer',
                      description: 'Quantity'
                    },
                    price: {
                      type: 'number',
                      description: 'Unit price'
                    },
                    currencyCode: {
                      type: 'string',
                      description: 'Currency code',
                      example: 'USD'
                    },
                    subtotal: {
                      type: 'number',
                      description: 'Subtotal (price * quantity)'
                    },
                    createdAt: {
                      type: 'string',
                      format: 'date-time',
                      description: 'Creation timestamp'
                    },
                    updatedAt: {
                      type: 'string',
                      format: 'date-time',
                      description: 'Last update timestamp'
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
      description: 'Bad Request',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'integer',
            example: 400
          },
          message: {
            type: 'string',
            example: 'Invalid parameters'
          }
        }
      }
    },
    '404': {
      description: 'Shopping list not found',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'integer',
            example: 404
          },
          message: {
            type: 'string',
            example: 'Shopping list not found'
          }
        }
      }
    },
    '500': {
      description: 'Internal Server Error',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'integer',
            example: 500
          },
          message: {
            type: 'string',
            example: 'Internal server error'
          }
        }
      }
    }
  }
}; 