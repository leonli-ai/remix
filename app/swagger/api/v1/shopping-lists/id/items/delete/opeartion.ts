export const deleteShoppingListItemOperation = {
  tags: ['Shopping-List'],
  summary: 'Delete shopping list items',
  description: 'Delete items from a shopping list',
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
          listItemIds: {
                type: 'array',
                items: {
              type: 'integer',
              description: 'Shopping list item ID to delete',
              example: 1
                }
              }
          
        },
        required: ['storeName', 'customerId', 'itemIds']
      }
    }
  ],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'Shopping list items deleted successfully',
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
                  type: 'string',
                  description: 'Product ID',
                  example: '123'
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
                  description: 'Quantity of the product',
                  example: 5
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