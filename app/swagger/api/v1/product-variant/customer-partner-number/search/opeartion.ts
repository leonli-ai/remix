export const skuLookupOperation = {
  tags: ['Product Variant'],
  summary: 'Redirect to product page by partner information',
  description: 'Redirect to product page based on customer partner number search',
  parameters: [
    {
      name: 'q',
      in: 'query',
      required: true,
      type: 'string',
      description: 'Customer partner number to search',
      example: 'CPN123'
    },
    {
      name: 'companyId',
      in: 'query',
      required: true,
      type: 'string',
      description: 'Shopify B2B company ID',
      example: 'gid://shopify/Company/132134421'
    },
    {
      name: 'options',
      in: 'query',
      required: false,
      type: 'string',
      description: 'Shopify store domain',
      example: 'b2b-accelerator.myshopify.com'
    }
  ],
  security: [{ bearerAuth: [] }],
  responses: {
    '302': {
      description: 'Redirect to product page',
      headers: {
        Location: {
          type: 'string',
          description: 'URL of the product page',
          example: 'https://b2b-accelerator.myshopify.com/apps/customer-account/products/123456789'
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