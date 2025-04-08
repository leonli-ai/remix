export const createQuoteOperation = {
  tags: ['Quote Management'],
  description: 'Create a new quote',
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
            example: 'my-store'
          },
          quote: {
            type: 'object',
            description: 'Quote data',
            properties: {
              customerId: {
                type: 'string',
                description: 'Customer ID',
                example: 'gid://shopify/Customer/12345678'
              },
              companyLocationId: {
                type: 'string',
                description: 'Company location ID',
                nullable: true,
                example: 'gid://shopify/CompanyLocation/12345678'
              },
              currencyCode: {
                type: 'string',
                description: 'Currency code',
                example: 'USD'
              },
              requestNote: {
                type: 'string',
                description: 'Initial note for the quote (will be saved as a note of type "requested")',
                nullable: true,
                example: 'Customer requested a quote for bulk order'
              },
              poNumber: {
                type: 'string',
                description: 'Purchase order number',
                nullable: true,
                example: 'PO-12345'
              },
              expirationDate: {
                type: 'string',
                format: 'date-time',
                description: 'Expiration date',
                example: '2024-01-18T10:30:00Z'
              },
              quoteItems: {
                type: 'array',
                description: 'Quote items',
                items: {
                  type: 'object',
                  properties: {
                    productId: {
                      type: 'string',
                      description: 'Product ID',
                      example: 'gid://shopify/Product/12345678'
                    },
                    variantId: {
                      type: 'string',
                      description: 'Product variant ID',
                      example: 'gid://shopify/ProductVariant/12345678'
                    },
                    quantity: {
                      type: 'number',
                      description: 'Quantity',
                      minimum: 1,
                      example: 5
                    },
                    originalPrice: {
                      type: 'number',
                      description: 'Original price',
                      minimum: 0,
                      example: 99.99
                    },
                    offerPrice: {
                      type: 'number',
                      description: 'Offer price',
                      minimum: 0,
                      example: 89.99
                    },
                    description: {
                      type: 'string',
                      description: 'Item description',
                      nullable: true,
                      example: 'Bulk order discount applied'
                    }
                  },
                  required: ['productId', 'variantId', 'quantity', 'originalPrice', 'offerPrice']
                }
              }
            },
            required: ['customerId', 'currencyCode', 'quoteItems']
          }
        },
        required: ['storeName', 'quote']
      }
    }
  ],
  responses: {
    '201': {
      description: 'Quote created successfully',
      schema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Quote ID',
            example: 123
          },
          storeName: {
            type: 'string',
            description: 'Store name',
            example: 'my-store'
          },
          status: {
            type: 'string',
            enum: ['Draft', 'Submitted', 'Approved', 'Declined', 'Ordered'],
            description: 'Quote status',
            example: 'Submitted'
          },
          subtotal: {
            type: 'number',
            description: 'Quote subtotal',
            example: 449.95
          },
          currencyCode: {
            type: 'string',
            description: 'Currency code',
            example: 'USD'
          },
          poNumber: {
            type: 'string',
            description: 'Purchase order number',
            nullable: true,
            example: 'PO-12345'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
            example: '2024-01-18T10:30:00Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
            example: '2024-01-18T10:30:00Z'
          },
          createdBy: {
            type: 'string',
            description: 'Creator ID',
            example: 'gid://shopify/Customer/12345678'
          },
          updatedBy: {
            type: 'string',
            description: 'Last updater ID',
            nullable: true,
            example: null
          },
          actionBy: {
            type: 'string',
            description: 'ID of user who approved/rejected the quote',
            nullable: true,
            example: null
          },
          quoteItems: {
            type: 'array',
            description: 'Quote items',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Quote item ID',
                  example: 1
                },
                productId: {
                  type: 'string',
                  description: 'Product ID',
                  example: 'gid://shopify/Product/12345678'
                },
                variantId: {
                  type: 'string',
                  description: 'Product variant ID',
                  example: 'gid://shopify/ProductVariant/12345678'
                },
                quantity: {
                  type: 'number',
                  description: 'Quantity',
                  minimum: 1,
                  example: 5
                },
                originalPrice: {
                  type: 'number',
                  description: 'Original price',
                  minimum: 0,
                  example: 99.99
                },
                offerPrice: {
                  type: 'number',
                  description: 'Offer price',
                  minimum: 0,
                  example: 89.99
                },
                description: {
                  type: 'string',
                  description: 'Item description',
                  nullable: true,
                  example: 'Bulk order discount applied'
                }
              }
            }
          },
          notes: {
            type: 'array',
            description: 'Quote notes',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Note ID',
                  example: 1
                },
                quoteId: {
                  type: 'number',
                  description: 'Quote ID',
                  example: 123
                },
                noteType: {
                  type: 'string',
                  enum: ['submitted', 'approved', 'declined'],
                  description: 'Type of note',
                  example: 'submitted'
                },
                noteContent: {
                  type: 'string',
                  description: 'Note content',
                  example: 'Customer requested a quote for bulk order'
                },
                createdBy: {
                  type: 'string',
                  description: 'Creator ID',
                  example: 'gid://shopify/Customer/12345678'
                },
                createdAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Creation timestamp',
                  example: '2024-01-18T10:30:00Z'
                },
                updatedAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Last update timestamp',
                  example: '2024-01-18T10:30:00Z'
                }
              }
            }
          },
        }
      }
    },
    '400': {
      description: 'Invalid request parameters',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'number',
            example: 400
          },
          message: {
            type: 'string',
            example: 'Invalid request parameters'
          }
        }
      }
    },
    '500': {
      description: 'Internal server error',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'number',
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