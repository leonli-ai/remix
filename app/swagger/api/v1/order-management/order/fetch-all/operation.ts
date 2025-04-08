export const fetchOrdersOperation = {
  tags: ['Order Management'],
  summary: 'Fetch all orders',
  description: 'Retrieves a paginated list of orders with optional filtering',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'customerId'],
        properties: {
          storeName: {
            type: 'string',
            description: 'Name of the store',
            example: 'b2b-accelerator.myshopify.com'
          },
          customerId: {
            type: 'string',
            description: 'ID of the customer',
            example: 'gid://shopify/Customer/123456789'
          },
          pagination: {
            type: 'object',
            properties: {
              first: {
                type: 'number',
                description: 'Number of items to fetch (forward pagination)',
                minimum: 1,
                maximum: 100,
                default: 10,
                example: 10
              },
              after: {
                type: 'string',
                description: 'Cursor for forward pagination',
                example: 'cursor_xyz'
              },
              last: {
                type: 'number',
                description: 'Number of items to fetch (backward pagination)',
                minimum: 1,
                example: 10
              },
              before: {
                type: 'string',
                description: 'Cursor for backward pagination',
                example: 'cursor_xyz'
              },
              query: {
                type: 'string',
                description: 'Search query to filter orders',
                example: 'status:OPEN'
              },
              reverse: {
                type: 'boolean',
                description: 'Reverse sort order',
                example: true
              },
              sortKey: {
                type: 'string',
                enum: [
                  'CREATED_AT',
                  'CUSTOMER_NAME',
                  'DESTINATION',
                  'FINANCIAL_STATUS',
                  'FULFILLMENT_STATUS',
                  'ID',
                  'ORDER_NUMBER',
                  'PO_NUMBER',
                  'PROCESSED_AT',
                  'RELEVANCE',
                  'TOTAL_ITEMS_QUANTITY',
                  'TOTAL_PRICE',
                  'UPDATED_AT'
                ],
                description: 'Field to sort by',
                example: 'CREATED_AT'
              }
            }
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Successfully retrieved orders',
      schema: {
        type: 'object',
        properties: {
          orders: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { 
                  type: 'string',
                  example: 'gid://shopify/Order/6120803139804'
                },
                name: { 
                  type: 'string',
                  example: '#1007'
                },
                createdAt: { 
                  type: 'string',
                  example: '2024-12-18T08:07:52Z'
                },
                closed: { 
                  type: 'boolean',
                  example: false
                },
                cancelledAt: { 
                  type: 'string',
                  nullable: true,
                  example: null
                },
                status: { 
                  type: 'string',
                  enum: ['OPEN', 'CANCELLED'],
                  description: 'Order status determined by closed and cancelledAt fields',
                  example: 'OPEN'
                },
                customer: {
                  type: 'object',
                  nullable: true,
                  properties: {
                    id: { 
                      type: 'string',
                      example: 'gid://shopify/Customer/7790891565276'
                    },
                    email: { 
                      type: 'string',
                      example: 'example@email.com'
                    },
                    firstName: { 
                      type: 'string',
                      nullable: true
                    },
                    lastName: { 
                      type: 'string',
                      nullable: true
                    }
                  }
                },
                metafields: {
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
                              namespace: {
                                type: 'string',
                                example: 'app--193933737985--custom'
                              },
                              key: {
                                type: 'string',
                                example: 'draftOrder'
                              },
                              value: {
                                type: 'string',
                                example: '{"draftOrderId":"gid://shopify/DraftOrder/123456"}'
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                tags: {
                  type: 'array',
                  items: { 
                    type: 'string'
                  },
                  example: ['approved']
                },
                currentTotalPriceSet: {
                  type: 'object',
                  properties: {
                    shopMoney: {
                      type: 'object',
                      properties: {
                        amount: { 
                          type: 'string',
                          example: '24.95'
                        },
                        currencyCode: { 
                          type: 'string',
                          example: 'USD'
                        }
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
                      properties: {
                        id: {
                          type: 'string',
                          example: 'gid://shopify/Company/7660306652'
                        },
                        name: {
                          type: 'string',
                          example: 'NorthStar Plumbing'
                        }
                      }
                    },
                    contact: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string'
                        },
                        customer: {
                          type: 'object',
                          properties: {
                            displayName: {
                              type: 'string'
                            },
                            email: {
                              type: 'string'
                            },
                            firstName: {
                              type: 'string',
                              nullable: true
                            },
                            lastName: {
                              type: 'string',
                              nullable: true
                            },
                            numberOfOrders: {
                              type: 'string'
                            },
                            phone: {
                              type: 'string',
                              nullable: true
                            }
                          }
                        }
                      }
                    },
                    location: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string'
                        },
                        name: {
                          type: 'string'
                        },
                        shippingAddress: {
                          type: 'object',
                          properties: {
                            address1: {
                              type: 'string'
                            },
                            address2: {
                              type: 'string',
                              nullable: true
                            },
                            city: {
                              type: 'string'
                            },
                            countryCode: {
                              type: 'string'
                            },
                            formattedArea: {
                              type: 'string'
                            },
                            id: {
                              type: 'string'
                            },
                            province: {
                              type: 'string'
                            }
                          }
                        }
                      }
                    }
                  }
                },
                poNumber: { 
                  type: 'string',
                  nullable: true,
                  example: 'PO123'
                },
                paymentGatewayNames: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'List of payment gateway names',
                  example: ['manual', 'bogus']
                },
                displayFinancialStatus: { 
                  type: 'string',
                  nullable: true,
                  example: 'PENDING'
                },
                displayFulfillmentStatus: { 
                  type: 'string',
                  description: 'Order fulfillment status',
                  example: 'UNFULFILLED'
                },
                returnStatus: { 
                  type: 'string',
                  description: 'Order return status',
                  example: 'NO_RETURN'
                },
                cursor: {
                  type: 'string',
                  example: 'eyJsYXN0X2lkIjo2MTIwODAzMTM5ODA0LCJsYXN0X3ZhbHVlIjoiMjAyNC0xMi0xOCAwODowNzo1Mi41Mzk2NjIifQ=='
                },
                approver: {
                  type: 'object',
                  nullable: true,
                  properties: {
                    id: {
                      type: 'string',
                      example: 'gid://shopify/Customer/7821496582364'
                    },
                    firstName: {
                      type: 'string',
                      nullable: true,
                      example: 'vivianout'
                    },
                    lastName: {
                      type: 'string',
                      nullable: true,
                      example: 'outlook'
                    },
                    email: {
                      type: 'string',
                      example: 'viviandenga@outlook.com'
                    },
                    phone: {
                      type: 'string',
                      nullable: true
                    },
                    state: {
                      type: 'string',
                      example: 'DISABLED'
                    },
                    createdAt: {
                      type: 'string',
                      example: '2025-01-02T06:59:45Z'
                    },
                    updatedAt: {
                      type: 'string',
                      example: '2025-01-17T06:41:19Z'
                    }
                  }
                },
                paymentTerms: {
                  type: 'object',
                  nullable: true,
                  properties: {
                    id: {
                      type: 'string',
                      example: 'gid://shopify/PaymentTerms/123456'
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
                                    example: '2024-04-01T00:00:00Z'
                                  },
                                  issuedAt: {
                                    type: 'string',
                                    example: '2024-03-01T00:00:00Z'
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
          pagination: {
            type: 'object',
            properties: {
              hasNextPage: { 
                type: 'boolean',
                example: false
              },
              hasPreviousPage: { 
                type: 'boolean',
                example: false
              },
              endCursor: { 
                type: 'string',
                example: 'eyJsYXN0X2lkIjo2MTY0NzU2ODU3MDUyLCJsYXN0X3ZhbHVlIjoiMjAyNS0wMS0xNyAwODozOTowNi4yNzU1MDAifQ=='
              },
              startCursor: { 
                type: 'string',
                example: 'eyJsYXN0X2lkIjo2MTIwODAzMTM5ODA0LCJsYXN0X3ZhbHVlIjoiMjAyNC0xMi0xOCAwODowNzo1Mi41Mzk2NjIifQ=='
              },
              totalCount: { 
                type: 'number',
                example: 76
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