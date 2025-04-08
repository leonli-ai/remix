export const assignRoleOperation = {
  tags: ['Company Management'],
  summary: 'Batch assign roles to company contact',
  description: 'Assign or update multiple roles for a company contact at different locations. When changing between admin and non-admin roles, Shopify API will be called.',
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
            description: 'ID of the customer performing the action',
            example: 'gid://shopify/Customer/123456789'
          },
          data: {
            type: 'object',
            required: ['companyId', 'companyContactId'],
            properties: {
              companyId: {
                type: 'string',
                description: 'ID of the company',
                example: 'gid://shopify/Company/987654321'
              },
              companyContactId: {
                type: 'string',
                description: 'ID of the contact to assign roles to',
                example: 'gid://shopify/CompanyContact/123456'
              },
              roleAssignments: {
                type: 'array',
                description: 'List of location and role assignments',
                items: {
                  type: 'object',
                  required: ['companyLocationId', 'roleId'],
                  properties: {
                    companyLocationId: {
                      type: 'string',
                      description: 'ID of the company location',
                      example: 'gid://shopify/CompanyLocation/456789'
                    },
                    companyId: {
                      type: 'string',
                      description: 'ID of the company. Must be provided only when companyLocationId is not provided. Cannot be used together with companyLocationId',
                      example: 'gid://shopify/Company/987654321'
                    },
                    roleId: {
                      type: 'string',
                      description: 'ID of the role to assign',
                      example: '2'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Roles successfully assigned',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'number',
            example: 200
          },
          message: {
            type: 'string',
            example: 'Role assigned successfully'
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
            example: 'When companyId is provided, roleId must be "1" (admin)'
          }
        }
      }
    },
    '404': {
      description: 'Role or company contact not found',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'number',
            example: 404
          },
          message: {
            type: 'string',
            example: 'Customer is not associated with the company. Please associate the customer with the company first.'
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