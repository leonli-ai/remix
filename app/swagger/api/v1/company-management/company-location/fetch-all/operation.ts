export const fetchAllLocationsOperation = {
  tags: ['Company Management'],
  summary: 'Fetch all company locations with pagination',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'customerId', 'companyId', 'pagination'],
        properties: {
          storeName: {
            type: 'string',
            description: 'Name of the store',
            example: 'b2b-accelerator.myshopify.com'
          },
          customerId: {
            type: 'string',
            description: 'ID of the customer performing the action',
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
                example: 'eyJsYXN0X2lkIjo4fQ==',
                required: false
              },
              query: {
                type: 'string',
                description: 'Search query to filter locations by name',
                example: 'name:location name',
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
      description: 'Company locations retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          companyLocations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'Location ID',
                  example: 'gid://shopify/CompanyLocation/123456'
                },
                name: {
                  type: 'string',
                  description: 'Location name',
                  example: 'Main Office'
                },
                shippingAddress: {
                  type: 'object',
                  properties: {
                    firstName: {
                      type: 'string',
                      description: 'First name',
                      example: 'John'
                    },
                    lastName: {
                      type: 'string',
                      description: 'Last name',
                      example: 'Doe'
                    },
                    address1: {
                      type: 'string',
                      description: 'Address line 1',
                      example: '123 Main St'
                    },
                    address2: {
                      type: 'string',
                      description: 'Address line 2',
                      example: 'Suite 100'
                    },
                    city: {
                      type: 'string',
                      description: 'City',
                      example: 'San Francisco'
                    },
                    companyName: {
                      type: 'string',
                      description: 'Company name',
                      example: 'Acme Inc.'
                    },
                    province: {
                      type: 'string',
                      description: 'Province/State',
                      example: 'CA'
                    },
                    zip: {
                      type: 'string',
                      description: 'ZIP/Postal code',
                      example: '94105'
                    },
                    country: {
                      type: 'string',
                      description: 'Country',
                      example: 'United States'
                    },
                    countryCode: {
                      type: 'string',
                      description: 'Country code',
                      example: 'US'
                    },
                    recipient: {
                      type: 'string',
                      description: 'Recipient name',
                      example: 'John Doe'
                    },
                    zoneCode: {
                      type: 'string',
                      description: 'Zone code',
                      example: 'CA'
                    },
                    phone: {
                      type: 'string',
                      description: 'Phone number',
                      example: '+1 (555) 123-4567'
                    }
                  }
                }
              }
            }
          },
          pagination: {
            type: 'object',
            properties: {
              hasNextPage: {
                type: 'boolean',
                description: 'Whether there are more pages available',
                example: true
              },
              hasPreviousPage: {
                type: 'boolean',
                description: 'Whether there are previous pages',
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
                example: 'eyJsYXN0X2lkIjo4fQ=='
              },
              totalCount: {
                type: 'number',
                description: 'Total number of locations',
                example: 50
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