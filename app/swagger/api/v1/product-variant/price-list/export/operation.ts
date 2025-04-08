export const exportPriceListOperation = {
  tags: ['Product Variant'],
  summary: 'Export price list for a company location',
  description: 'Exports a price list containing product variants and their prices for a specific company location. The export can be in XLSX format (multiple sheets per catalog) or CSV format (single sheet with catalog column).',
  operationId: 'exportPriceList',
  parameters: [
    {
      in: 'body',
      name: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['companyLocationId', 'storeName', 'customerId'],
        properties: {
          companyLocationId: {
            type: 'string',
            description: 'The ID of the company location to export prices for',
            example: 'gid://shopify/CompanyLocation/12345'
          },
          storeName: {
            type: 'string',
            description: 'The name of the store',
            example: 'my-store.myshopify.com'
          },
          customerId: {
            type: 'string',
            description: 'The ID of the customer requesting the export',
            example: 'gid://shopify/Customer/67890'
          },
          format: {
            type: 'string',
            enum: ['xlsx', 'csv'],
            default: 'xlsx',
            description: 'The format of the export file. XLSX creates multiple sheets (one per catalog), CSV creates a single sheet with catalog column.'
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Successfully exported price list',
      schema: {
        type: 'file'
      }
    },
    '400': {
      description: 'Invalid request parameters',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Invalid request parameters'
          },
          code: {
            type: 'number',
            example: 400
          },
          error: {
            type: 'string',
            example: 'BAD_REQUEST'
          }
        }
      }
    },
    '401': {
      description: 'Customer does not have access to the company location',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Customer does not have access to this location'
          },
          code: {
            type: 'number',
            example: 401
          },
          error: {
            type: 'string',
            example: 'UNAUTHORIZED_ACCESS'
          }
        }
      }
    },
    '404': {
      description: 'No price data found or customer has no company locations',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'No catalogs found with price data'
          },
          code: {
            type: 'number',
            example: 404
          },
          error: {
            type: 'string',
            example: 'NO_PRICE_DATA'
          }
        }
      }
    },
    '500': {
      description: 'Internal server error or error fetching data from Shopify',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Failed to fetch catalogs data'
          },
          code: {
            type: 'number',
            example: 500
          },
          error: {
            type: 'string',
            example: 'FETCH_ERROR'
          }
        }
      }
    }
  }
}; 