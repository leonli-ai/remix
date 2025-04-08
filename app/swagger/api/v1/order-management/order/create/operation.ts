
export const createOrderOperation = {
  tags: ['Order Management'],
  summary: 'Create an order',
  description: 'Create a new order or draft order based on company location configuration',
  operationId: 'createOrder',
  parameters: [
    {
      in: 'body',
      name: 'body',
      required: true,
      schema: {
        type: 'object',
        required: [
          'storeName',
          'customerId',
          'companyLocationId',
          'items',
          'currencyCode'
        ],
        properties: {
          storeName: {
            type: 'string',
            description: 'Store name for Shopify operations'
          },
          customerId: {
            type: 'string',
            description: 'Customer ID who is creating the order'
          },
          companyLocationId: {
            type: 'string',
            description: 'Company location ID for shipping and billing addresses'
          },
          poNumber: {
            type: 'string',
            description: 'Optional purchase order number'
          },
          note: {
            type: 'string',
            description: 'Optional note for the order'
          },
          poLink: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'URL of the PO image'
              },
              fileType: {
                type: 'string',
                description: 'File type of the PO image'
              }
            }
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              required: [
                'variantId',
                'quantity',
                'price'
              ],
              properties: {
                variantId: {
                  type: 'string',
                  description: 'Product variant ID'
                },
                quantity: {
                  type: 'integer',
                  description: 'Quantity of the item'
                },
                price: {
                  type: 'number',
                  description: 'Price of the item'
                }
              }
            }
          },
          currencyCode: {
            type: 'string',
            description: 'Currency code for the order'
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Order created successfully',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'integer',
            example: 200
          },
          message: {
            type: 'string',
            example: 'Order created successfully'
          },
          data: {
            type: 'object',
            properties: {
              orderId: {
                type: 'string',
                description: 'ID of the created order'
              },
              draftOrderId: {
                type: 'string',
                description: 'ID of the created draft order'
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
          code: {
            type: 'integer',
            example: 400
          },
          message: {
            type: 'string'
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                code: {
                  type: 'string'
                },
                message: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    },
    '404': {
      description: 'Not Found - Customer email or shipping address not found',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'integer',
            example: 404
          },
          message: {
            type: 'string'
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
            type: 'string'
          }
        }
      }
    }
  }
};