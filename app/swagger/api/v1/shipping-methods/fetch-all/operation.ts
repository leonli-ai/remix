export const fetchShippingMethodsOperation = {
  tags: ['Shipping Methods'],
  summary: 'Fetch eligible shipping methods',
  description: 'Get eligible shipping methods for a given address and order details',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'countryCode', 'orderTotal'],
        properties: {
          storeName: {
            type: 'string',
            description: 'Store name',
            example: 'zachary-b2b-demo.myshopify.com'
          },
          countryCode: {
            type: 'string',
            description: 'Country code (ISO 3166-1 alpha-2)',
            example: 'US'
          },
          provinceCode: {
            type: 'string',
            description: 'Province/State code',
            example: 'CA'
          },
          orderTotal: {
            type: 'number',
            description: 'Total order amount',
            example: 100.00
          },
          orderWeight: {
            type: 'number',
            description: 'Total order weight',
            example: 5.0
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Successfully retrieved eligible shipping methods',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Shipping method ID'
            },
            name: {
              type: 'string',
              description: 'Shipping method name'
            },
            description: {
              type: 'string',
              description: 'Shipping method description'
            },
            active: {
              type: 'boolean',
              description: 'Whether the shipping method is active'
            },
            rateProvider: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['DeliveryRateDefinition', 'DeliveryParticipant'],
                  description: 'Type of rate provider'
                },
                definition: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      description: 'Rate provider ID'
                    },
                    price: {
                      type: 'object',
                      properties: {
                        amount: {
                          type: 'string',
                          description: 'Price amount'
                        },
                        currencyCode: {
                          type: 'string',
                          description: 'Currency code'
                        }
                      }
                    }
                  }
                },
                participant: {
                  type: 'object',
                  properties: {
                    carrierService: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          description: 'Carrier service ID'
                        },
                        formattedName: {
                          type: 'string',
                          description: 'Formatted carrier service name'
                        },
                        name: {
                          type: 'string',
                          description: 'Carrier service name'
                        }
                      }
                    },
                    fixedFee: {
                      type: 'object',
                      properties: {
                        amount: {
                          type: 'string',
                          description: 'Fixed fee amount'
                        },
                        currencyCode: {
                          type: 'string',
                          description: 'Currency code'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
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