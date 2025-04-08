export const skuListLookupOperation = {
  tags: ['Product Variant'],
  summary: 'Batch querying sku ids',
  description: 'Batch querying sku ids based on store name, company ID and customer partner number',
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
          companyId: {
            type: 'string',
            description: 'Company ID',
            example: 'gid://shopify/Company/132134421'
          },
          data:{
            type: 'array',
            description: 'Array of customer partner number',
            example: ['CPN789', 'CPN790']
          }
        },
        required: ['storeName', 'companyId','data']
      }
    }
 
  ],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'Successfully retrieved SKU ID',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'integer',
            description: 'Response code',
            example: 200
          },
          skuDetails: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                storeName: {
                  type: 'string',
                  description: 'Store name',
                  example: 'acme-store.myshopify.com'
                },
                skuId: {
                  type: 'string',
                  description: 'Product SKU ID',
                  example: 'SKU123'
                },
                companyId: {
                  type: 'string',
                  description: 'Company ID',
                  example: '1234567890'
                },
                customerPartnerNumber: {
                  type: 'string',
                  description: 'Customer partner number',
                  example: '1234567890'
                },
                createdAt: {
                  type: 'string',
                  description: 'Creation date',
                  example: '2022-01-01T00:00:00Z'
                },
                updatedAt: {
                  type: 'string',
                  description: 'Last update date',
                  example: '2022-01-01T00:00:00Z'
                }
              },
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