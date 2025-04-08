export const exportMappingOperation = {
  tags: ['Product Variant'],
  summary: 'Export store company mappings',
  description: 'Export store company mappings to XLSX format (default) or CSV',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'companyId'],
        properties: {
          storeName: {
            type: 'string',
            description: 'Store name',
            example: 'b2b-accelerator.myshopify.com'
          },
          companyId: {
            type: 'string',
            description: 'Company ID to filter by',
            example: 'gid://shopify/Company/123456'
          },
          format: {
            type: 'string',
            enum: ['csv', 'xlsx'],
            description: 'Export file format',
            default: 'xlsx'
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Successfully exported data',
      schema: {
        type: 'file'
      }
    },
    '400': {
      description: 'Invalid request parameters'
    },
    '500': {
      description: 'Internal server error'
    }
  }
}; 