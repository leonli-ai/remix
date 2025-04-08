export const createShoppingListOperation = {
  tags: ['Shopping-List'],
  summary: 'Create a shopping list',
  description: 'Create a shopping list',
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
            example: '1234567890'
          },
          companyLocationId: {
            type: 'string',
            description: 'Company Location ID',
            example: '1234567890'
          },
          data: {
            type: 'object',
            properties:{
              shoppingListName: {
                type: 'string',
                description: 'Shopping list name',
                example: 'Acme Store Shopping List'
              },
              isDefault: {
                type: 'boolean',
                description: 'Whether the shopping list is a default list',
                example: 'false'
              },
              description: {
                type: 'string',
                description: 'Shopping list description',
                example: 'Acme Store Shopping List'
              }
            }
          },
         
        },
        required: ['storeName', 'customerId', 'name']
      }
    }
  ],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'Shopping list created successfully',
      schema: {
        type: 'object',
        properties: {
          shoppingList: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                description: 'Shopping list ID',
                example: 1
              },
              customerId: {
                type: 'integer',
                description: 'User ID',
                example: 'gid://shopify/Customer/132134421'
              },
              companyLocationId: {
                type: 'string',
                description: 'Company location ID',
                example: 'gid://shopify/CompanyLocation/132134421'
              },
              description: {
                type: 'string',
                description: 'Shopping list description'
              },
              name: {
                type: 'string',
                description: 'Shopping list name',
                example: 'Acme Store Shopping List'
              },
              subtotal: {
                type: 'integer',
                description: 'Shopping list subtotal',
                example: 0
              },
              items: {
                type: 'integer',
                description: 'Number of items in the shopping list',
                example: 0
              },
              isDefault: {
                type: 'boolean',
                description: 'Whether the shopping list is a default list',
                example: false
              },
              createdAt: {
                type: 'string',
                description: 'Creation date and time',
                example: '2024-03-21T10:00:00Z'
              },
              updatedAt: {
                type: 'string',
                description: 'Last update date and time',
                example: '2024-03-21T10:00:00Z'
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
    '409': {
      description: 'Conflict'
    },
    '500': {
      description: 'Internal Server Error'
    }
  }
}; 