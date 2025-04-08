export const updateShoppingListItemOperation = {
  tags: ['Shopping-List'],
  summary: 'Update or add shopping list items',
  description: 'Update existing items or add new items to a shopping list. Customer partner numbers will be automatically fetched and updated if not provided.',
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
          companyId: {
            type: 'string',
            description: 'Company ID (optional, will be extracted from companyLocationId if not provided)',
            example: 'gid://shopify/Company/132134421'
          },
          data: {
            type: 'object',
            properties: {
              listItems: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                      description: 'Shopping list item ID (required for updates, omit for new items)',
                      example: 1
                    },
                    productId: {
                      type: 'string',
                      description: 'Product ID',
                      example: 'gid://shopify/Product/123'
                    },
                    productVariantId: {
                      type: 'string',
                      description: 'Product variant ID',
                      example: 'gid://shopify/ProductVariant/123'
                    },
                    productName: {
                      type: 'string',
                      description: 'Product name',
                      example: 'Sample Product'
                    },
                    skuId: {
                      type: 'string',
                      description: 'SKU ID',
                      example: 'PROD123'
                    },
                    productImageUrl: {
                      type: 'string',
                      description: 'Product image url',
                      example: 'https://example.com/image.jpg'
                    },
                    url: {
                      type: 'string',
                      description: 'Product url',
                      example: 'https://store.com/products/123'
                    },
                    customerPartnerNumber: {
                      type: 'string',
                      description: 'Customer partner number (optional, will be fetched if not provided)',
                      example: 'CPN123'
                    },
                    quantity: {
                      type: 'integer',
                      description: 'Quantity of the product',
                      example: 5
                    }
                  },
                  required: ['productId', 'productVariantId', 'skuId', 'quantity']
                }
              }
            },
            required: ['listItems']
          }
        },
        required: ['storeName', 'customerId', 'companyLocationId']
      }
    }
  ],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'Shopping list items updated successfully',
      schema: {
        type: 'object',
        properties: {
          listItems: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                  description: 'Shopping list item ID',
                  example: 1
                },
                shoppingListId: {
                  type: 'integer',
                  description: 'Shopping list ID',
                  example: 1
                },
                productId: {
                  type: 'integer',
                  description: 'Product ID',
                  example: 123
                },
                productName: {
                  type: 'string',
                  description: 'Product name',
                  example: 'Sample Product'
                },
                skuId: {
                  type: 'string',
                  description: 'SKU ID',
                  example: 'PROD123'
                },
                productImageUrl: {
                  type: 'string',
                  description: 'Product image url',
                  example: 'https://example.com/image.jpg'
                },
                url: {
                  type: 'string',
                  description: 'Product url',
                  example: 'https://store.com/products/123'
                },
                customerPartnerNumber: {
                  type: 'string',
                  description: 'Customer partner number',
                  example: 'CPN123'
                },
                quantity: {
                  type: 'integer',
                  description: 'Updated quantity of the product',
                  example: 5
                },
                price: {
                  type: 'integer',
                  description: 'Price of the product',
                  example: 100
                },
                subtotal: {
                  type: 'integer',
                  description: 'Updated subtotal of the product',
                  example: 500
                },
                createdAt: {
                  type: 'string',
                  description: 'Creation date and time',
                  example: '2024-03-21T10:00:00Z'
                },
                updatedAt: {
                  type: 'string',
                  description: 'Last update date and time',
                  example: '2024-03-21T10:30:00Z'
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