export const scanExpiredOperation = {
  tags: ['Quote Management'],
  summary: 'Scan and expire quotes that have passed their expiration date',
  operationId: 'scanExpiredQuotes',
  responses: {
    '200': {
      description: 'Successfully expired quotes',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'number',
            example: 200,
          },
          message: {
            type: 'string',
            example: 'Successfully expired 5 quotes',
          },
          data: {
            type: 'object',
            properties: {
              expiredQuoteIds: {
                type: 'array',
                items: {
                  type: 'number',
                },
                example: [1001, 1002, 1003, 1004, 1005],
              },
            },
          },
        },
      },
    },
    405: {
      description: 'Method not allowed',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              code: {
                type: 'number',
                example: 405,
              },
              message: {
                type: 'string',
                example: 'Method not allowed',
              },
            },
          },
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              code: {
                type: 'number',
                example: 500,
              },
              message: {
                type: 'string',
                example: 'Internal server error',
              },
            },
          },
        },
      },
    },
  },
};
