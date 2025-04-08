export const getQuoteByIdOperation = {
  tags: ['Quote Management'],
  summary: 'Get quote details by ID',
  description: 'Retrieves detailed information about a specific quote including its items and notes history',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'quoteId', 'customerId', 'companyLocationId'],
        properties: {
          storeName: {
            type: 'string',
            description: 'Name of the store',
            example: 'b2b-accelerator.myshopify.com'
          },
          quoteId: {
            type: 'number',
            description: 'ID of the quote to retrieve',
            example: 123
          },
          customerId: {
            type: 'string',
            description: 'ID of the customer requesting the quote details',
            example: 'gid://shopify/Customer/123456789'
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
      description: 'Quote details retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            example: 123
          },
          storeName: {
            type: 'string',
            example: 'b2b-accelerator.myshopify.com'
          },
          status: {
            type: 'string',
            enum: ['Draft', 'Submitted', 'Approved', 'Declined', 'Ordered'],
            example: 'Submitted'
          },
          subtotal: {
            type: 'number',
            example: 299.99
          },
          currencyCode: {
            type: 'string',
            example: 'USD'
          },
          poNumber: {
            type: 'string',
            nullable: true,
            description: 'Purchase order number',
            example: 'PO-12345'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-18T10:30:00Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-18T10:30:00Z'
          },
          createdBy: {
            type: 'string',
            example: 'gid://shopify/Customer/123456789'
          },
          updatedBy: {
            type: 'string',
            nullable: true,
            example: 'gid://shopify/Customer/123456789'
          },
          actionBy: {
            type: 'string',
            nullable: true,
            example: 'gid://shopify/Customer/123456789'
          },
          customer: {
            type: 'object',
            nullable: true,
            properties: {
              id: {
                type: 'string',
                example: 'gid://shopify/Customer/123456789'
              },
              firstName: {
                type: 'string',
                example: 'John'
              },
              lastName: {
                type: 'string',
                example: 'Doe'
              },
              email: {
                type: 'string',
                example: 'john.doe@example.com'
              },
              phone: {
                type: 'string',
                nullable: true,
                example: '+1234567890'
              },
              state: {
                type: 'string',
                nullable: true,
                example: 'ENABLED'
              }
            }
          },
          companyLocationDetails: {
            type: 'object',
            nullable: true,
            properties: {
              id: {
                type: 'string',
                example: 'gid://shopify/CompanyLocation/123456789'
              },
              name: {
                type: 'string',
                example: 'Headquarters'
              },
              company: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: 'gid://shopify/Company/123456789'
                  },
                  name: {
                    type: 'string',
                    example: 'ACME Corp'
                  }
                }
              },
              shippingAddress: {
                type: 'object',
                properties: {
                  address1: {
                    type: 'string',
                    example: '123 Main St'
                  },
                  address2: {
                    type: 'string',
                    nullable: true,
                    example: 'Suite 100'
                  },
                  city: {
                    type: 'string',
                    example: 'San Francisco'
                  },
                  companyName: {
                    type: 'string',
                    example: 'ACME Corp'
                  },
                  country: {
                    type: 'string',
                    example: 'United States'
                  },
                  countryCode: {
                    type: 'string',
                    example: 'US'
                  },
                  formattedAddress: {
                    type: 'string',
                    example: '123 Main St, Suite 100, San Francisco, CA 94105, USA'
                  },
                  phone: {
                    type: 'string',
                    example: '+1234567890'
                  },
                  province: {
                    type: 'string',
                    example: 'California'
                  },
                  zip: {
                    type: 'string',
                    example: '94105'
                  },
                  zoneCode: {
                    type: 'string',
                    example: 'CA'
                  }
                }
              },
              billingAddress: {
                type: 'object',
                properties: {
                  address1: {
                    type: 'string',
                    example: '123 Main St'
                  },
                  address2: {
                    type: 'string',
                    nullable: true,
                    example: 'Suite 100'
                  },
                  city: {
                    type: 'string',
                    example: 'San Francisco'
                  },
                  companyName: {
                    type: 'string',
                    example: 'ACME Corp'
                  },
                  country: {
                    type: 'string',
                    example: 'United States'
                  },
                  countryCode: {
                    type: 'string',
                    example: 'US'
                  },
                  formattedAddress: {
                    type: 'string',
                    example: '123 Main St, Suite 100, San Francisco, CA 94105, USA'
                  },
                  phone: {
                    type: 'string',
                    example: '+1234567890'
                  },
                  province: {
                    type: 'string',
                    example: 'California'
                  },
                  zip: {
                    type: 'string',
                    example: '94105'
                  },
                  zoneCode: {
                    type: 'string',
                    example: 'CA'
                  }
                }
              }
            }
          },
          quoteItems: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  example: 1
                },
                quantity: {
                  type: 'number',
                  example: 5
                },
                originalPrice: {
                  type: 'number',
                  example: 99.99
                },
                offerPrice: {
                  type: 'number',
                  example: 89.99
                },
                description: {
                  type: 'string',
                  nullable: true,
                  example: 'Bulk order discount applied'
                },
                variant: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      example: 'gid://shopify/ProductVariant/123456789'
                    },
                    sku: {
                      type: 'string',
                      example: 'SKU-123'
                    },
                    title: {
                      type: 'string',
                      example: 'Blue / Large'
                    },
                    price: {
                      type: 'number',
                      example: 99.99
                    },
                    compareAtPrice: {
                      type: 'number',
                      nullable: true,
                      example: 119.99
                    },
                    inventoryQuantity: {
                      type: 'number',
                      example: 100
                    },
                    product: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          example: 'gid://shopify/Product/123456789'
                        },
                        title: {
                          type: 'string',
                          example: 'Premium T-Shirt'
                        },
                        description: {
                          type: 'string',
                          example: 'High-quality cotton t-shirt'
                        },
                        featuredImage: {
                          type: 'object',
                          nullable: true,
                          properties: {
                            url: {
                              type: 'string',
                              example: 'https://cdn.shopify.com/s/files/1/0123/4567/8901/products/t-shirt.jpg'
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
          notes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  example: 1
                },
                quoteId: {
                  type: 'number',
                  example: 123
                },
                noteType: {
                  type: 'string',
                  enum: ['submitted', 'approved', 'declined'],
                  example: 'submitted'
                },
                noteContent: {
                  type: 'string',
                  example: 'Initial quote request submitted'
                },
                createdBy: {
                  type: 'string',
                  example: 'gid://shopify/Customer/123456789'
                },
                createdAt: {
                  type: 'string',
                  format: 'date-time',
                  example: '2024-01-18T10:30:00Z'
                },
                updatedAt: {
                  type: 'string',
                  format: 'date-time',
                  example: '2024-01-18T10:30:00Z'
                }
              }
            }
          }
        }
      }
    },
    '400': {
      description: 'Invalid request parameters',
      schema: {
        type: 'object',
        properties: {
          code: { type: 'number', example: 400 },
          message: { type: 'string', example: 'Invalid parameters' }
        }
      }
    },
    '404': {
      description: 'Quote not found',
      schema: {
        type: 'object',
        properties: {
          code: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Quote not found' }
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