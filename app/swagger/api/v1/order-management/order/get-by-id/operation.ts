export const getOrderByIdOperation = {
  tags: ['Order Management'],
  summary: 'Get order details by ID',
  description: 'Retrieve detailed information about a specific order',
  operationId: 'getOrderById',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['orderId', 'storeName', 'customerId', 'companyLocationId'],
        properties: {
          orderId: {
            type: 'string',
            description: 'The ID of the order to retrieve',
            example: 'gid://shopify/Order/123456789'
          },
          storeName: {
            type: 'string',
            description: 'The name of the store',
            example: 'my-store'
          },
          customerId: {
            type: 'string',
            description: 'The ID of the customer',
            example: 'gid://shopify/Customer/987654321'
          },
          companyLocationId: {
            type: 'string',
            description: 'The ID of the company location for contextual pricing',
            example: 'gid://shopify/Location/123456'
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Order details retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          customer: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string' },
              defaultAddress: {
                type: 'object',
                nullable: true,
                properties: {
                  address1: { type: 'string' },
                  address2: { type: 'string', nullable: true },
                  city: { type: 'string' },
                  province: { type: 'string' },
                  country: { type: 'string' },
                  zip: { type: 'string' },
                  phone: { type: 'string', nullable: true },
                  company: { type: 'string', nullable: true }
                }
              }
            }
          },
          purchasingEntity: {
            type: 'object',
            nullable: true,
            properties: {
              company: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' }
                }
              },
              location: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' }
                }
              }
            }
          },
          lineItems: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                sku: { type: 'string', nullable: true },
                quantity: { type: 'number' },
                isGiftCard: { type: 'boolean' },
                requiresShipping: { type: 'boolean' },
                taxable: { type: 'boolean' },
                variantTitle: { type: 'string' },
                originalTotal: { type: 'string' },
                discountedTotalSet: {
                  type: 'object',
                  properties: {
                    presentmentMoney: {
                      type: 'object',
                      properties: {
                        amount: { type: 'string' },
                        currencyCode: { type: 'string' }
                      }
                    },
                    shopMoney: {
                      type: 'object',
                      properties: {
                        amount: { type: 'string' },
                        currencyCode: { type: 'string' }
                      }
                    }
                  }
                },
                discountedUnitPriceSet: {
                  type: 'object',
                  properties: {
                    presentmentMoney: {
                      type: 'object',
                      properties: {
                        amount: { type: 'string' },
                        currencyCode: { type: 'string' }
                      }
                    },
                    shopMoney: {
                      type: 'object',
                      properties: {
                        amount: { type: 'string' },
                        currencyCode: { type: 'string' }
                      }
                    }
                  }
                },
                originalUnitPriceSet: {
                  type: 'object',
                  properties: {
                    presentmentMoney: {
                      type: 'object',
                      properties: {
                        amount: { type: 'string' },
                        currencyCode: { type: 'string' }
                      }
                    },
                    shopMoney: {
                      type: 'object',
                      properties: {
                        amount: { type: 'string' },
                        currencyCode: { type: 'string' }
                      }
                    }
                  }
                },
                product: {
                  type: 'object',
                  nullable: true,
                  properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    totalVariants: { type: 'number' }
                  }
                },
                variant: {
                  type: 'object',
                  nullable: true,
                  properties: {
                    id: { type: 'string' },
                    price: { type: 'string' },
                    contextualPricing: {
                      type: 'object',
                      properties: {
                        price: {
                          type: 'object',
                          properties: {
                            amount: { type: 'string' }
                          }
                        }
                      }
                    },
                    metafield: {
                      type: 'object',
                      properties: {
                        value: { type: 'string' },
                        key: { type: 'string' },
                        namespace: { type: 'string' }
                      }
                    }
                  }
                },
                image: {
                  type: 'object',
                  nullable: true,
                  properties: {
                    id: { type: 'string' },
                    altText: { type: 'string' },
                    transformedSrc: { type: 'string' }
                  }
                }
              }
            }
          },
          totalPriceSet: {
            type: 'object',
            properties: {
              shopMoney: {
                type: 'object',
                properties: {
                  amount: { type: 'string' },
                  currencyCode: { type: 'string' }
                }
              }
            }
          },
          totalTaxSet: {
            type: 'object',
            properties: {
              shopMoney: {
                type: 'object',
                properties: {
                  amount: { type: 'string' },
                  currencyCode: { type: 'string' }
                }
              }
            }
          },
          totalDiscountsSet: {
            type: 'object',
            properties: {
              shopMoney: {
                type: 'object',
                properties: {
                  amount: { type: 'string' },
                  currencyCode: { type: 'string' }
                }
              }
            }
          },
          lineItemsSubtotalPrice: {
            type: 'object',
            properties: {
              shopMoney: {
                type: 'object',
                properties: {
                  amount: { type: 'string' },
                  currencyCode: { type: 'string' }
                }
              }
            }
          },
          totalShippingPriceSet: {
            type: 'object',
            properties: {
              shopMoney: {
                type: 'object',
                properties: {
                  amount: { type: 'string' },
                  currencyCode: { type: 'string' }
                }
              }
            }
          },
          processedAt: { type: 'string' },
          note: { type: 'string', nullable: true },
          poNumber: { type: 'string', nullable: true },
          paymentGatewayNames: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of payment gateway names',
            example: ['manual', 'bogus']
          },
          displayFinancialStatus: { type: 'string' },
          displayFulfillmentStatus: { type: 'string' },
          returnStatus: { type: 'string' },
          createdAt: { type: 'string' },
          closed: { type: 'boolean' },
          cancelledAt: { type: 'string', nullable: true },
          tags: {
            type: 'array',
            items: { type: 'string' }
          },
          status: { 
            type: 'string',
            enum: ['OPEN', 'CLOSED', 'CANCELLED'],
            description: 'Order status determined by closed and cancelledAt fields'
          },
          billingAddress: {
            type: 'object',
            nullable: true,
            properties: {
              firstName: {
                type: 'string',
                example: 'John'
              },
              lastName: {
                type: 'string',
                example: 'Doe'
              },
              address1: {
                type: 'string',
                example: '123 Main St'
              },
              address2: {
                type: 'string',
                example: 'Suite 100'
              },
              city: {
                type: 'string',
                example: 'Toronto'
              },
              province: {
                type: 'string',
                example: 'Ontario'
              },
              provinceCode: {
                type: 'string',
                example: 'ON'
              },
              country: {
                type: 'string',
                example: 'Canada'
              },
              countryCodeV2: {
                type: 'string',
                example: 'CA'
              },
              zip: {
                type: 'string',
                example: 'M5V 2T6'
              },
              company: {
                type: 'string',
                example: 'Acme Inc'
              },
              phone: {
                type: 'string',
                example: '+1 (555) 555-5555'
              }
            }
          },
          shippingAddress: {
            type: 'object',
            nullable: true,
            properties: {
              firstName: {
                type: 'string',
                example: 'John'
              },
              lastName: {
                type: 'string',
                example: 'Doe'
              },
              address1: {
                type: 'string',
                example: '123 Main St'
              },
              address2: {
                type: 'string',
                example: 'Suite 100'
              },
              city: {
                type: 'string',
                example: 'Toronto'
              },
              province: {
                type: 'string',
                example: 'Ontario'
              },
              provinceCode: {
                type: 'string',
                example: 'ON'
              },
              country: {
                type: 'string',
                example: 'Canada'
              },
              countryCodeV2: {
                type: 'string',
                example: 'CA'
              },
              zip: {
                type: 'string',
                example: 'M5V 2T6'
              },
              company: {
                type: 'string',
                example: 'Acme Inc'
              },
              phone: {
                type: 'string',
                example: '+1 (555) 555-5555'
              }
            }
          },
          shippingLine: {
            type: 'object',
            nullable: true,
            properties: {
              title: {
                type: 'string',
                description: 'The title of the shipping method',
                example: 'Standard Shipping'
              },
              code: {
                type: 'string',
                description: 'The code of the shipping method',
                example: 'STANDARD'
              },
              source: {
                type: 'string',
                description: 'The source of the shipping method',
                example: 'shopify'
              },
              originalPriceSet: {
                type: 'object',
                properties: {
                  shopMoney: {
                    type: 'object',
                    properties: {
                      amount: { type: 'string', example: '10.00' },
                      currencyCode: { type: 'string', example: 'USD' }
                    }
                  }
                }
              }
            }
          },
          paymentTerms: {
            type: 'object',
            nullable: true,
            properties: {
              id: { 
                type: 'string',
                example: 'gid://shopify/PaymentTerms/123'
              },
              paymentTermsName: { 
                type: 'string',
                example: 'Net 30'
              },
              paymentTermsType: { 
                type: 'string',
                example: 'NET'
              },
              dueInDays: { 
                type: 'number',
                example: 30
              },
              overdue: { 
                type: 'boolean',
                example: false
              },
              paymentSchedules: {
                type: 'object',
                properties: {
                  edges: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        node: {
                          type: 'object',
                          properties: {
                            dueAt: { 
                              type: 'string',
                              format: 'date-time',
                              example: '2024-04-15T00:00:00Z'
                            },
                            issuedAt: { 
                              type: 'string',
                              format: 'date-time',
                              example: '2024-03-15T00:00:00Z'
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
      description: 'Order not found',
      schema: {
        type: 'object',
        properties: {
          code: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Order not found' }
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