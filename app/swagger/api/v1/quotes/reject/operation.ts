export const rejectQuoteOperation = {
  tags: ['Quote Management'],
  summary: 'Reject a quote',
  description: 'Rejects a quote that is in Requested status. Only admin users can perform this action. A rejection note will be stored in the quote notes.',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'quoteId', 'companyLocationId', 'customerId', 'rejectNote'],
        properties: {
          storeName: {
            type: 'string',
            description: 'Name of the store',
            example: 'b2b-accelerator.myshopify.com'
          },
          quoteId: {
            type: 'number',
            description: 'ID of the quote to reject',
            example: 123
          },
          companyLocationId: {
            type: 'string',
            description: 'ID of the company location',
            example: 'gid://shopify/CompanyLocation/123456789'
          },
          customerId: {
            type: 'string',
            description: 'ID of the admin user performing the rejection (will be used as actionBy)',
            example: 'gid://shopify/Customer/123456789'
          },
          rejectNote: {
            type: 'string',
            description: 'Note for rejecting the quote',
            minLength: 1,
            maxLength: 500,
            example: 'Prices are too low for our current cost structure'
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Quote rejected successfully',
      schema: {
        type: 'object',
        properties: {
          code: { 
            type: 'number', 
            example: 200 
          },
          message: { 
            type: 'string', 
            example: 'Quote rejected successfully' 
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
          message: { type: 'string', example: 'Invalid status transition from Approved to Rejected. Only Requested quotes can be rejected.' }
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