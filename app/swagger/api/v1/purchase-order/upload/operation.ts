export const purchaseOrderUploadOperation = {
  tags: ['Purchase Order Management'],
  summary: 'Upload a purchase order file',
  description: 'Upload a purchase order file for processing. Supports PDF and image files.',
  consumes: ['multipart/form-data'],
  parameters: [
    {
      name: 'storeName',
      in: 'formData',
      required: true,
      type: 'string',
      description: 'Name of the store',
      example: 'b2b-accelerator.myshopify.com'
    },
    {
      name: 'file',
      in: 'formData',
      required: true,
      type: 'file',
      description: 'The purchase order file to upload (PDF, JPEG, PNG, or BMP)'
    },
    {
      name: 'customerId',
      in: 'formData',
      // required: true,
      type: 'string',
      description: 'ID of the customer uploading the file',
      example: 'gid://shopify/Customer/7850624909532'
    },
    {
      name: 'companyId',
      in: 'formData',
      required: false,
      type: 'string',
      description: 'ID of the company associated with the purchase order',
      example: 'gid://shopify/Company/7660306652'
    },
    {
      name: 'companyLocationId',
      in: 'formData',
      required: false,
      type: 'string',
      description: 'ID of the company location associated with the purchase order',
      example: 'gid://shopify/CompanyLocation/7805829340'
    }
  ],
  responses: {
    '200': {
      description: 'File uploaded successfully',
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          fileUrl: {
            type: 'string',
            description: 'URL of the uploaded file',
            example: 'https://example.com/files/purchase-order.pdf'
          },
          fileId: {
            type: 'string',
            description: 'ID of the uploaded file',
            example: '123456789'
          }
        }
      }
    },
    '400': {
      description: 'Invalid request parameters',
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            example: 'Invalid file type'
          },
          error: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                example: 'INVALID_FILE_TYPE'
              },
              message: {
                type: 'string',
                example: 'Only PDF and image files are supported'
              }
            }
          }
        }
      }
    },
    '413': {
      description: 'File too large',
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            example: 'File too large'
          },
          error: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                example: 'FILE_TOO_LARGE'
              },
              message: {
                type: 'string',
                example: 'File size must not exceed 10MB'
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
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            example: 'Internal server error'
          },
          error: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                example: 'INTERNAL_ERROR'
              },
              message: {
                type: 'string',
                example: 'An unexpected error occurred while uploading the file'
              }
            }
          }
        }
      }
    }
  }
}; 