export const uploadOperation = {
  tags: ['Product Variant'],
  summary: 'Upload customer partner numbers',
  description: 'Upload customer partner numbers from Excel or CSV file',
  operationId: 'uploadCustomerPartnerNumbers',
  consumes: ['multipart/form-data'],
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
            description: 'Shopify store domain',
            example: 'my-store.myshopify.com'
          },
          companyId: {
            type: 'string',
            description: 'Shopify B2B company ID',
            example: 'gid://shopify/Company/12345'
          },
          format: {
            type: 'string',
            enum: ['xlsx', 'csv'],
            default: 'xlsx',
            description: 'File format'
          }
        }
      }
    },
    {
      name: 'file',
      in: 'formData',
      required: true,
      type: 'file',
      description: 'Excel or CSV file containing customer partner numbers'
    }
  ],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'Upload successful (may include partial failures)',
      schema: {
        type: 'object',
        required: ['success', 'message', 'totalProcessed', 'successCount', 'failureCount', 'failedRecords'],
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether any records were successfully processed',
            example: true
          },
          message: {
            type: 'string',
            description: 'Human-readable result message',
            example: 'Upload completed with some failures: 5 succeeded, 1 failed'
          },
          totalProcessed: {
            type: 'number',
            description: 'Total number of records processed',
            example: 6
          },
          successCount: {
            type: 'number',
            description: 'Number of successfully processed records',
            example: 5
          },
          failureCount: {
            type: 'number',
            description: 'Number of failed records',
            example: 1
          },
          failedRecords: {
            type: 'array',
            description: 'Details of failed records',
            items: {
              type: 'object',
              required: ['record', 'row', 'errors'],
              properties: {
                record: {
                  type: 'object',
                  description: 'The record that failed validation',
                  properties: {
                    skuId: { 
                      type: 'string',
                      example: '240029'
                    },
                    customerPartnerNumber: { 
                      type: 'string',
                      example: ''
                    },
                    productName: { 
                      type: 'string',
                      example: 'Allied Rubber & Gasket 1-1-8 in. Steel Split Ring with Floor and Ceiling Plate'
                    }
                  }
                },
                row: {
                  type: 'number',
                  description: 'Row number in the uploaded file',
                  example: 6
                },
                errors: {
                  type: 'array',
                  description: 'List of validation errors for this record',
                  items: { type: 'string' },
                  example: ['Customer Partner Number is required and cannot be empty']
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
          message: { 
            type: 'string',
            example: 'Invalid parameters'
          },
          code: { 
            type: 'number',
            example: 400
          },
          error: { 
            type: 'string',
            example: 'VALIDATION_ERROR'
          },
          errors: {
            type: 'array',
            items: { type: 'string' },
            example: ['File is required']
          }
        }
      }
    },
    '401': {
      description: 'Unauthorized'
    },
    '403': {
      description: 'Forbidden'
    },
    '500': {
      description: 'Internal Server Error'
    }
  }
}; 