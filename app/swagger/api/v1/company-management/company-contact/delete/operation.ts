export const deleteCompanyContactOperation = {
  tags: ['Company Management'],
  summary: 'Delete company contact',
  description: 'Delete a company contact and revoke all associated roles across all locations',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'customerId', 'data'],
        properties: {
          storeName: {
            type: 'string',
            description: 'Name of the store',
            example: 'b2b-accelerator.myshopify.com'
          },
          customerId: {
            type: 'string',
            description: 'ID of the customer performing the deletion (for authorization)',
            example: 'gid://shopify/Customer/7806700060892'
          },
          data: {
            type: 'object',
            required: ['companyContactId', 'companyId'],
            properties: {
              companyContactId: {
                type: 'string',
                description: 'ID of the company contact to be deleted',
                example: 'gid://shopify/Customer/7806665588956'
              },
              companyId: {
                type: 'string',
                description: 'ID of the company',
                example: 'gid://shopify/Company/7660306652'
              }
            }
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Successfully deleted company contact',
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            example: 'Company contact deleted successfully'
          }
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
            example: 'Invalid parameters'
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'invalid_type'
                },
                message: {
                  type: 'string',
                  example: 'Required'
                },
                path: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  example: ['data', 'companyContactId']
                }
              }
            }
          }
        }
      }
    },
    '404': {
      description: 'Contact or role assignments not found',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'number',
            example: 404
          },
          message: {
            type: 'string',
            example: 'Role assignments not found'
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