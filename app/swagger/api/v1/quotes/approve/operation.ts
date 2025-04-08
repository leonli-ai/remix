export const approveQuoteOperation = {
  tags: ['Quote Management'],
  summary: 'Approve a quote',
  description: 'Approves a quote that is in Requested status. Only admin users can perform this action. An optional approval note can be provided.',
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
            description: 'ID of the quote to approve',
            example: 123
          },
          companyLocationId: {
            type: 'string',
            description: 'ID of the company location',
            example: 'gid://shopify/CompanyLocation/123456789'
          },
          customerId: {
            type: 'string',
            description: 'ID of the admin user performing the approval (will be used as actionBy)',
            example: 'gid://shopify/Customer/123456789'
          },
          approveNote: {
            type: 'string',
            description: 'Optional note for approving the quote',
            minLength: 1,
            maxLength: 500,
            example: 'Quote approved with standard terms'
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Quote approved successfully',
      schema: {
        type: 'object',
        properties: {
          code: { 
            type: 'number', 
            example: 200 
          },
          message: { 
            type: 'string', 
            example: 'Quote approved successfully' 
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
          message: { type: 'string', example: 'Invalid status transition from Rejected to Approved. Only Requested quotes can be approved.' }
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