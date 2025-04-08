export const expireQuoteOperation = {
  tags: ['Quote Management'],
  summary: 'Expire a quote',
  description: 'Expires a quote that is in Submitted or Approved status. Only admin users can perform this action. An optional expiration note can be provided.',
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
            description: 'ID of the quote to expire',
            example: 123
          },
          companyLocationId: {
            type: 'string',
            description: 'ID of the company location',
            example: 'gid://shopify/CompanyLocation/123456789'
          },
          customerId: {
            type: 'string',
            description: 'ID of the admin user performing the expiration (will be used as actionBy)',
            example: 'gid://shopify/Customer/123456789'
          },
          expireNote: {
            type: 'string',
            description: 'Optional note for expiring the quote',
            minLength: 1,
            maxLength: 500,
            example: 'Quote expired due to inactivity'
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Quote expired successfully',
      schema: {
        type: 'object',
        properties: {
          code: { 
            type: 'number', 
            example: 200 
          },
          message: { 
            type: 'string', 
            example: 'Quote expired successfully' 
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
          message: { type: 'string', example: 'Invalid status transition from Declined to Expired. Only Submitted or Approved quotes can be expired.' }
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