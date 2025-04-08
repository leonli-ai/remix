export const getCompanyContactListOperation = {
  tags: ['Company Management'],
  summary: 'Fetch company contacts',
  description: 'Retrieves a paginated list of company contacts with optional email filtering',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'customerId', 'companyId'],
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
          },
          companyId: {
            type: 'string',
            description: 'ID of the company',
            example: 'gid://shopify/Company/987654321'
          },
          pagination: {
            type: 'object',
            properties: {
              first: {
                type: 'number',
                description: 'Number of items to fetch (forward pagination)',
                minimum: 1,
                default: 10,
                example: 10
              },
              after: {
                type: 'string',
                description: 'Cursor for next page (forward pagination)',
                example: 'eyJsYXN0X2lkIjo0fQ==',
                required: false
              },
              last: {
                type: 'number',
                description: 'Number of items to fetch (backward pagination)',
                minimum: 1,
                example: 10
              },
              before: {
                type: 'string',
                description: 'Cursor for previous page (backward pagination)',
                example: 'eyJsYXN0X2lkIjo0fQ==',
                required: false
              },
              query: {
                type: 'string',
                description: 'Search query to filter contacts',
                example: 'email:john@example.com',
                required: false
              }
            }
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Successfully retrieved company contacts',
      schema: {
        type: 'object',
        properties: {
          companyContacts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'Contact ID',
                  example: 'gid://shopify/CompanyContact/123456'
                },
                customer: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      description: 'Customer ID',
                      example: 'gid://shopify/Customer/123456789'
                    },
                    email: {
                      type: 'string',
                      description: 'Customer email',
                      example: 'john@example.com'
                    },
                    firstName: {
                      type: 'string',
                      description: 'Customer first name',
                      example: 'John'
                    },
                    lastName: {
                      type: 'string',
                      description: 'Customer last name',
                      example: 'Doe'
                    },
                    state: {
                      type: 'string',
                      description: 'Customer account state',
                      example: 'ENABLED'
                    }
                  }
                },
                isMainContact: {
                  type: 'boolean',
                  description: 'Indicates if this is the main contact',
                  example: true
                }
              }
            }
          },
          pagination: {
            type: 'object',
            properties: {
              hasNextPage: {
                type: 'boolean',
                description: 'Indicates if there are more pages',
                example: true
              },
              hasPreviousPage: {
                type: 'boolean',
                description: 'Indicates if there are previous pages',
                example: false
              },
              startCursor: {
                type: 'string',
                description: 'Cursor for the first item in current page',
                example: 'eyJsYXN0X2lkIjo0fQ=='
              },
              endCursor: {
                type: 'string',
                description: 'Cursor for the last item in current page',
                example: 'eyJsYXN0X2lkIjo0fQ=='
              },
              totalCount: {
                type: 'number',
                description: 'Total number of items',
                example: 100
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
                  example: ['pagination.first']
                }
              }
            }
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