export const submitDraftQuoteOperation = {
  tags: ['Quote Management'],
  summary: 'Submit draft quote',
  description: 'Changes the status of a draft quote to Requested. The customerId from the request will be used as actionBy.',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'customerId', 'draftQuoteId', 'companyLocationId'],
        properties: {
          storeName: {
            type: 'string',
            description: 'Name of the store',
            example: 'b2b-accelerator.myshopify.com'
          },
          customerId: {
            type: 'string',
            description: 'ID of the customer (will also be used as actionBy)',
            example: 'gid://shopify/Customer/123456789'
          },
          draftQuoteId: {
            type: 'number',
            description: 'ID of the draft quote to submit',
            example: 123
          },
          companyLocationId: {
            type: 'string',
            description: 'ID of the company location',
            example: 'gid://shopify/CompanyLocation/123456789'
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Draft quote submitted successfully',
      schema: {
        type: 'object',
        properties: {
          code: { 
            type: 'number', 
            example: 200 
          },
          message: { 
            type: 'string', 
            example: 'Draft quote submitted successfully' 
          }
        }
      }
    },
    '400': {
      description: 'Invalid request parameters',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Invalid request parameters. Please check your request body.' },
          code: { type: 'number', example: 400 },
          error: { type: 'string', example: 'INVALID_INPUT' },
          details: { 
            type: 'object',
            example: {
              errors: [
                {
                  code: 'invalid_type',
                  expected: 'number',
                  received: 'string',
                  path: ['draftQuoteId'],
                  message: 'Expected number, received string'
                }
              ]
            }
          }
        }
      }
    },
    '404': {
      description: 'Draft quote not found',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Quote with ID 123 not found' },
          code: { type: 'number', example: 404 },
          error: { type: 'string', example: 'RESOURCE_NOT_FOUND' }
        }
      }
    },
    '403': {
      description: 'Unauthorized access',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Unauthorized to submit this quote' },
          code: { type: 'number', example: 403 },
          error: { type: 'string', example: 'UNAUTHORIZED' }
        }
      }
    },
    '405': {
      description: 'Method not allowed',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Method not allowed' },
          code: { type: 'number', example: 405 },
          error: { type: 'string', example: 'METHOD_NOT_ALLOWED' }
        }
      }
    },
    '500': {
      description: 'Internal server error',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'An unexpected error occurred' },
          code: { type: 'number', example: 500 },
          error: { type: 'string', example: 'UNKNOWN_ERROR' }
        }
      }
    }
  }
}; 