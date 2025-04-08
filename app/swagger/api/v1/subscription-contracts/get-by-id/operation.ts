export const getSubscriptionContractByIdOperation = {
  tags: ['Subscription Contracts'],
  summary: 'Get subscription contract by ID',
  description: 'Retrieves a specific subscription contract by its ID with all related details including customer information, company details, and line items.',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'id'],
        properties: {
          storeName: {
            type: 'string',
            description: 'The Shopify store name',
            example: 'demo.myshopify.com'
          },
          id: {
            type: 'integer',
            description: 'The subscription contract ID',
            example: 2001
          },
          customerId: {
            type: 'string',
            description: 'The Shopify customer ID (optional)',
            example: 'gid://shopify/Customer/1'
          }
        }
      }
    }
  ],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'Successfully retrieved subscription contract',
      schema: {
        type: 'object',
        properties: {
          subscriptionContract: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                description: 'Subscription contract ID',
                example: 2001
              },
              name: {
                type: 'string',
                description: 'Subscription contract name',
                example: 'Monthly Paper Supplies'
              },
              status: {
                type: 'string',
                description: 'Subscription contract status',
                enum: ['active', 'paused', 'cancelled', 'pending', 'completed', 'declined'],
                example: 'active'
              },
              currencyCode: {
                type: 'string',
                description: 'Currency code',
                example: 'USD'
              },
              startDate: {
                type: 'string',
                format: 'date-time',
                description: 'Subscription start date',
                example: '2023-01-01T00:00:00.000Z'
              },
              endDate: {
                type: 'string',
                format: 'date-time',
                description: 'Subscription end date',
                example: '2023-12-31T00:00:00.000Z'
              },
              nextOrderDate: {
                type: 'string',
                format: 'date-time',
                description: 'Next order creation date',
                example: '2023-02-01T00:00:00.000Z'
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'Creation timestamp',
                example: '2023-01-01T00:00:00.000Z'
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                description: 'Last update timestamp',
                example: '2023-01-01T00:00:00.000Z'
              },
              intervalValue: {
                type: 'integer',
                description: 'Subscription interval value',
                example: 1
              },
              intervalUnit: {
                type: 'string',
                description: 'Subscription interval unit',
                enum: ['daily', 'weekly', 'weeks', 'monthly', 'months', 'quarterly', 'biannual', 'annually', 'yearly'],
                example: 'months'
              },
              deliveryAnchor: {
                type: 'integer',
                description: 'Day of delivery (1-7 for weekly, 1-31 for monthly)',
                example: 15
              },
              shippingCost: {
                type: 'number',
                description: 'Shipping cost',
                example: 10.50
              },
              shippingMethodName: {
                type: 'string',
                description: 'Shipping method name',
                example: 'Standard Shipping'
              },
              shippingMethodId: {
                type: 'string',
                description: 'Shipping method ID',
                example: 'gid://shopify/DeliveryMethod/1'
              },
              note: {
                type: 'string',
                nullable: true,
                description: 'Additional notes',
                example: 'Special delivery instructions'
              },
              poNumber: {
                type: 'string',
                nullable: true,
                description: 'Purchase order number',
                example: 'PO-12345'
              },
              customer: {
                type: 'object',
                nullable: true,
                properties: {
                  id: {
                    type: 'string',
                    description: 'Customer ID',
                    example: 'gid://shopify/Customer/1'
                  },
                  firstName: {
                    type: 'string',
                    nullable: true,
                    description: 'Customer first name',
                    example: 'John'
                  },
                  lastName: {
                    type: 'string',
                    nullable: true,
                    description: 'Customer last name',
                    example: 'Doe'
                  },
                  email: {
                    type: 'string',
                    description: 'Customer email',
                    example: 'john.doe@example.com'
                  },
                  phone: {
                    type: 'string',
                    nullable: true,
                    description: 'Customer phone number',
                    example: '+1234567890'
                  },
                  state: {
                    type: 'string',
                    nullable: true,
                    description: 'Customer state',
                    example: 'active'
                  },
                  createdAt: {
                    type: 'string',
                    nullable: true,
                    format: 'date-time',
                    description: 'Customer creation date',
                    example: '2023-01-01T00:00:00.000Z'
                  },
                  updatedAt: {
                    type: 'string',
                    nullable: true,
                    format: 'date-time',
                    description: 'Customer last update date',
                    example: '2023-01-01T00:00:00.000Z'
                  }
                }
              },
              companyLocation: {
                type: 'object',
                nullable: true,
                properties: {
                  id: {
                    type: 'string',
                    description: 'Company location ID',
                    example: 'gid://shopify/CompanyLocation/1'
                  },
                  name: {
                    type: 'string',
                    description: 'Company location name',
                    example: 'Main Office'
                  },
                  externalId: {
                    type: 'string',
                    nullable: true,
                    description: 'Company location external ID',
                    example: 'LOC001'
                  },
                  paymentTerms: {
                    type: 'object',
                    nullable: true,
                    properties: {
                      id: {
                        type: 'string',
                        description: 'Payment terms ID',
                        example: 'gid://shopify/PaymentTerms/1'
                      },
                      description: {
                        type: 'string',
                        description: 'Payment terms description',
                        example: 'Payment due in 30 days'
                      },
                      dueInDays: {
                        type: 'integer',
                        description: 'Days until payment is due',
                        example: 30
                      },
                      name: {
                        type: 'string',
                        description: 'Payment terms name',
                        example: 'Net 30'
                      },
                      paymentTermsType: {
                        type: 'string',
                        description: 'Payment terms type',
                        example: 'net'
                      },
                      translatedName: {
                        type: 'string',
                        nullable: true,
                        description: 'Translated payment terms name',
                        example: 'Net 30'
                      }
                    }
                  },
                  billingAddress: {
                    type: 'object',
                    nullable: true,
                    properties: {
                      firstName: {
                        type: 'string',
                        description: 'First name',
                        example: 'John'
                      },
                      lastName: {
                        type: 'string',
                        description: 'Last name',
                        example: 'Doe'
                      },
                      phone: {
                        type: 'string',
                        description: 'Phone number',
                        example: '+1234567890'
                      },
                      company: {
                        type: 'string',
                        description: 'Company name',
                        example: 'ACME Inc.'
                      },
                      address1: {
                        type: 'string',
                        description: 'Address line 1',
                        example: '123 Main St'
                      },
                      address2: {
                        type: 'string',
                        nullable: true,
                        description: 'Address line 2',
                        example: 'Suite 101'
                      },
                      city: {
                        type: 'string',
                        description: 'City',
                        example: 'San Francisco'
                      },
                      province: {
                        type: 'string',
                        description: 'Province/State',
                        example: 'CA'
                      },
                      country: {
                        type: 'string',
                        description: 'Country',
                        example: 'US'
                      },
                      zip: {
                        type: 'string',
                        description: 'ZIP/Postal code',
                        example: '94107'
                      },
                      provinceCode: {
                        type: 'string',
                        description: 'Province/State code',
                        example: 'CA'
                      },
                      countryCode: {
                        type: 'string',
                        description: 'Country code',
                        example: 'US'
                      }
                    }
                  },
                  shippingAddress: {
                    type: 'object',
                    nullable: true,
                    properties: {
                      firstName: {
                        type: 'string',
                        description: 'First name',
                        example: 'John'
                      },
                      lastName: {
                        type: 'string',
                        description: 'Last name',
                        example: 'Doe'
                      },
                      phone: {
                        type: 'string',
                        description: 'Phone number',
                        example: '+1234567890'
                      },
                      company: {
                        type: 'string',
                        description: 'Company name',
                        example: 'ACME Inc.'
                      },
                      address1: {
                        type: 'string',
                        description: 'Address line 1',
                        example: '123 Main St'
                      },
                      address2: {
                        type: 'string',
                        nullable: true,
                        description: 'Address line 2',
                        example: 'Suite 101'
                      },
                      city: {
                        type: 'string',
                        description: 'City',
                        example: 'San Francisco'
                      },
                      province: {
                        type: 'string',
                        description: 'Province/State',
                        example: 'CA'
                      },
                      country: {
                        type: 'string',
                        description: 'Country',
                        example: 'US'
                      },
                      zip: {
                        type: 'string',
                        description: 'ZIP/Postal code',
                        example: '94107'
                      },
                      provinceCode: {
                        type: 'string',
                        description: 'Province/State code',
                        example: 'CA'
                      },
                      countryCode: {
                        type: 'string',
                        description: 'Country code',
                        example: 'US'
                      }
                    }
                  }
                }
              },
              lines: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                      description: 'Line item ID',
                      example: 3001
                    },
                    variantId: {
                      type: 'string',
                      description: 'Product variant ID',
                      example: 'gid://shopify/ProductVariant/1'
                    },
                    title: {
                      type: 'string',
                      description: 'Product title',
                      example: 'Premium Paper'
                    },
                    quantity: {
                      type: 'integer',
                      description: 'Quantity',
                      example: 5
                    },
                    price: {
                      type: 'number',
                      description: 'Price per unit',
                      example: 20.00
                    },
                    sku: {
                      type: 'string',
                      description: 'Product SKU',
                      example: 'PAPER-001'
                    },
                    taxable: {
                      type: 'boolean',
                      description: 'Whether the item is taxable',
                      example: true
                    },
                    imageSrc: {
                      type: 'string',
                      nullable: true,
                      description: 'Product image URL',
                      example: 'https://cdn.shopify.com/s/files/1/0001/0001/products/paper.jpg'
                    },
                    customerPartnerNumber: {
                      type: 'string',
                      nullable: true,
                      description: "Customer's internal product code",
                      example: 'CPN12345'
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