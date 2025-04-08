export const cancelQuoteOperation = {
  tags: ['Quote Management'],
  summary: 'Cancel a quote',
  description: 'Cancels a quote that is in Submitted status. Only admin users can perform this action. An optional cancellation note can be provided.',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'quoteId', 'companyLocationId', 'customerId'],
        properties: {
          storeName: {
            type: 'string',
            description: 'Name of the store',
            example: 'b2b-accelerator.myshopify.com'
          },
          quoteId: {
            type: 'number',
            description: 'ID of the quote to cancel',
            example: 123
          },
          companyLocationId: {
            type: 'string',
            description: 'ID of the company location',
            example: 'gid://shopify/CompanyLocation/123456789'
          },
          customerId: {
            type: 'string',
            description: 'ID of the admin user performing the cancellation (will be used as actionBy)',
            example: 'gid://shopify/Customer/123456789'
          },
          cancelNote: {
            type: 'string',
            description: 'Optional note for cancelling the quote',
            minLength: 1,
            maxLength: 500,
            example: 'Quote cancelled due to customer request'
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Quote cancelled successfully',
      schema: {
        type: 'object',
        properties: {
          code: { 
            type: 'number', 
            example: 200 
          },
          message: { 
            type: 'string', 
            example: 'Quote cancelled successfully' 
          }
        }
      }
    },
    '400': {
      description: 'Invalid request parameters or invalid status transition',
      schema: {
        type: 'object',
        properties: {
          code: { type: 'number', example: 400 },
          message: { type: 'string', example: 'Invalid status transition from Approved to Cancelled. Only Submitted quotes can be cancelled.' }
        }
      }
    },
    '404': {
      description: 'Quote not found',
      schema: {
        type: 'object',
        properties: {
          code: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Quote with ID 123 not found' }
        }
      }
    },
    '405': {
      description: 'Method not allowed',
      schema: {
        type: 'object',
        properties: {
          code: { type: 'number', example: 405 },
          message: { type: 'string', example: 'Method not allowed' }
        }
      }
    },
    '500': {
      description: 'Internal server error',
      schema: {
        type: 'object',
        properties: {
          code: { type: 'number', example: 500 },
          message: { type: 'string', example: 'Internal server error' }
        }
      }
    }
  }
}; 