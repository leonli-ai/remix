export const getCompanyContactByIdOperation = {
  tags: ['Company Management'],
  summary: 'Get company contact details by ID',
  description: 'Get company contact details including roles and location information',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['companyContactId', 'customerId', 'companyId', 'storeName'],
        properties: {
          storeName: {
            type: 'string',
            description: 'Name of the store',
            example: 'b2b-accelerator.myshopify.com'
          },
          customerId: {
            type: 'string',
            description: 'ID of the customer',
            example: 'gid://shopify/Customer/789012'
          },
          companyId: {
            type: 'string',
            description: 'ID of the company',
            example: 'gid://shopify/Company/345678'
          },
          companyContactId: {
            type: 'string',
            description: 'ID of the company contact',
            example: 'gid://shopify/CompanyContact/123456'
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Successfully retrieved company contact details',
      schema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'gid://shopify/CompanyContact/123456'
          },
          customer: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                example: 'gid://shopify/Customer/789012'
              },
              email: {
                type: 'string',
                example: 'john.doe@example.com'
              },
              firstName: {
                type: 'string',
                example: 'John'
              },
              lastName: {
                type: 'string',
                example: 'Doe'
              }
            }
          },
          isMainContact: {
            type: 'boolean',
            example: true
          },
          roles: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: 'role_123'
                },
                name: {
                  type: 'string',
                  example: 'Location Admin'
                },
                companyLocation: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      example: 'gid://shopify/CompanyLocation/901234'
                    },
                    shippingAddress: {
                      type: 'object',
                      properties: {
                        address1: {
                          type: 'string',
                          example: '123 Main St'
                        },
                        address2: {
                          type: 'string',
                          example: 'Suite 100'
                        },
                        city: {
                          type: 'string',
                          example: 'Toronto'
                        },
                        province: {
                          type: 'string',
                          example: 'ON'
                        },
                        zip: {
                          type: 'string',
                          example: 'M5V 2T6'
                        },
                        country: {
                          type: 'string',
                          example: 'Canada'
                        },
                        countryCode: {
                          type: 'string',
                          example: 'CA'
                        }
                      }
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
                  example: ['companyContactId']
                }
              }
            }
          }
        }
      }
    },
    '404': {
      description: 'Company contact not found',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'number',
            example: 404
          },
          message: {
            type: 'string',
            example: 'Company contact not found'
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