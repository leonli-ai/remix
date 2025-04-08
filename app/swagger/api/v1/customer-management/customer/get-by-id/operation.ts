export const getCustomerDetailsOperation = {
  tags: ['Customer Management'],
  summary: 'Get customer details',
  description: 'Retrieves customer information including company and role assignments',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'customerId'],
        properties: {
          storeName: {
            type: 'string',
            description: 'Name of the store',
            example: 'b2b-accelerator.myshopify.com'
          },
          customerId: {
            type: 'string',
            description: 'ID of the customer',
            example: 'gid://shopify/Customer/123456789'
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Successfully retrieved customer details',
      schema: {
        type: 'object',
        properties: {
          customer: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                example: 'gid://shopify/Customer/7813932056796'
              },
              firstName: {
                type: 'string',
                example: 'John'
              },
              lastName: {
                type: 'string',
                example: 'Doe'
              },
              email: {
                type: 'string',
                example: 'john774.doe@example.com'
              },
              phone: {
                type: 'string',
                example: null
              },
              state: {
                type: 'string',
                example: 'DISABLED'
              },
              companyId: {
                type: 'string',
                example: 'gid://shopify/Company/8145109212'
              },
              companyContactId: {
                type: 'string',
                example: 'gid://shopify/CompanyContact/905314524'
              }
            }
          },
          company: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                example: 'gid://shopify/Company/8145109212'
              },
              name: {
                type: 'string',
                example: 'james zhou test company'
              }
            }
          },
          roles: {
            type: 'array',
            description: 'List of assigned roles (can be either location-based or company-wide)',
            items: {
              type: 'object',
              oneOf: [
                {
                  description: 'Location-based role',
                  required: ['id', 'name', 'companyLocationId'],
                  properties: {
                    id: {
                      type: 'string',
                      description: 'Role ID',
                      example: '2'
                    },
                    name: {
                      type: 'string',
                      description: 'Role name',
                      example: 'Location Admin'
                    },
                    companyLocationId: {
                      type: 'string',
                      description: 'Company location ID for location-specific roles',
                      example: 'gid://shopify/CompanyLocation/7517733084'
                    }
                  }
                },
                {
                  description: 'Company-wide role',
                  required: ['id', 'name', 'companyId'],
                  properties: {
                    id: {
                      type: 'string',
                      description: 'Role ID',
                      example: '1'
                    },
                    name: {
                      type: 'string',
                      description: 'Role name',
                      example: 'Admin'
                    },
                    companyId: {
                      type: 'string',
                      description: 'Company ID for company-wide roles',
                      example: 'gid://shopify/Company/8145109212'
                    }
                  }
                }
              ]
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
          code: {
            type: 'number',
            example: 400
          },
          message: {
            type: 'string',
            example: 'Invalid parameters'
          }
        }
      }
    },
    '403': {
      description: 'No role assigned',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'number',
            example: 403
          },
          message: {
            type: 'string',
            example: 'User has no assigned roles. Please contact admin for role assignment.'
          }
        }
      }
    },
    '404': {
      description: 'Customer not found',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'number',
            example: 404
          },
          message: {
            type: 'string',
            example: 'Customer not found'
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