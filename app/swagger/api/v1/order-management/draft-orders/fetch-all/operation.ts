export const fetchDraftOrdersOperation = {
    tags: ['Order Management'],
    summary: 'Fetch all draft orders',
    description: 'Retrieves a paginated list of draft orders with optional filtering and sorting',
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
                  description: 'Number of items to fetch',
                  minimum: 1,
                  maximum: 100,
                  default: 10,
                  example: 10
                },
                after: {
                  type: 'string',
                  description: 'Cursor for pagination',
                  example: 'cursor_xyz'
                },
                query: {
                  type: 'string',
                  description: 'Search query',
                  example: 'status:OPEN'
                },
                sortKey: {
                  type: 'string',
                  enum: ['CREATED_AT', 'CUSTOMER', 'NUMBER', 'STATUS', 'TOTAL_PRICE', 'UPDATED_AT'],
                  description: 'Field to sort by'
                },
                reverse: {
                  type: 'boolean',
                  description: 'Reverse sort order'
                }
              }
            }
          }
        }
      }
    ],
    responses: {
      '200': {
        description: 'Successfully retrieved draft orders',
        schema: {
          type: 'object',
          properties: {
            draftOrders: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: 'gid://shopify/DraftOrder/123456'
                  },
                  name: {
                    type: 'string',
                    example: '#D123'
                  },
                  tags: {
                    type: 'array',
                    items: {
                      type: 'string'
                    },
                    example: ['approved', 'rejected']
                  },
                  rejectedBy: {
                    type: 'object',
                    nullable: true,
                    properties: {
                      id: {
                        type: 'string',
                        example: 'gid://shopify/Customer/123456789'
                      },
                      displayName: {
                        type: 'string',
                        example: 'John Doe'
                      },
                      email: {
                        type: 'string',
                        example: 'john.doe@example.com'
                      },
                      firstName: {
                        type: 'string',
                        example: 'John'
                      },
                      lastName: {
                        type: 'string',
                        example: 'Doe'
                      },
                      fullName: {
                        type: 'string',
                        example: 'John Doe',
                        nullable: true
                      },
                      numberOfOrders: {
                        type: 'number',
                        example: 5
                      },
                      phone: {
                        type: 'string',
                        example: '+1234567890',
                        nullable: true
                      },
                      defaultAddress: {
                        type: 'object',
                        nullable: true,
                        properties: {
                          formattedArea: {
                            type: 'string',
                            example: 'New York, NY 10001'
                          },
                          id: {
                            type: 'string',
                            example: 'gid://shopify/MailingAddress/123456'
                          },
                          address1: {
                            type: 'string',
                            example: '123 Main St'
                          },
                          address2: {
                            type: 'string',
                            example: 'Apt 4B'
                          },
                          city: {
                            type: 'string',
                            example: 'New York'
                          },
                          countryCode: {
                            type: 'string',
                            example: 'US'
                          },
                          province: {
                            type: 'string',
                            example: 'NY'
                          }
                        }
                      }
                    }
                  },
                  approvedBy: {
                    type: 'object',
                    nullable: true,
                    properties: {
                      id: {
                        type: 'string',
                        example: 'gid://shopify/Customer/123456789'
                      },
                      displayName: {
                        type: 'string',
                        example: 'John Doe'
                      },
                      email: {
                        type: 'string',
                        example: 'john.doe@example.com'
                      },
                      firstName: {
                        type: 'string',
                        example: 'John'
                      },
                      lastName: {
                        type: 'string',
                        example: 'Doe'
                      },
                      fullName: {
                        type: 'string',
                        example: 'John Doe',
                        nullable: true
                      },
                      numberOfOrders: {
                        type: 'number',
                        example: 5
                      },
                      phone: {
                        type: 'string',
                        example: '+1234567890',
                        nullable: true
                      },
                      defaultAddress: {
                        type: 'object',
                        nullable: true,
                        properties: {
                          formattedArea: {
                            type: 'string',
                            example: 'New York, NY 10001'
                          },
                          id: {
                            type: 'string',
                            example: 'gid://shopify/MailingAddress/123456'
                          },
                          address1: {
                            type: 'string',
                            example: '123 Main St'
                          },
                          address2: {
                            type: 'string',
                            example: 'Apt 4B'
                          },
                          city: {
                            type: 'string',
                            example: 'New York'
                          },
                          countryCode: {
                            type: 'string',
                            example: 'US'
                          },
                          province: {
                            type: 'string',
                            example: 'NY'
                          }
                        }
                      }
                    }
                  },
                  customer: {
                    type: 'object',
                    nullable: true,
                    properties: {
                      id: {
                        type: 'string',
                        example: 'gid://shopify/Customer/123456789'
                      },
                      displayName: {
                        type: 'string',
                        example: 'John Doe'
                      },
                      email: {
                        type: 'string',
                        example: 'john.doe@example.com'
                      },
                      firstName: {
                        type: 'string',
                        example: 'John'
                      },
                      lastName: {
                        type: 'string',
                        example: 'Doe'
                      },
                      fullName: {
                        type: 'string',
                        example: 'John Doe',
                        nullable: true
                      },
                      numberOfOrders: {
                        type: 'number',
                        example: 5
                      },
                      phone: {
                        type: 'string',
                        example: '+1234567890',
                        nullable: true
                      },
                      defaultAddress: {
                        type: 'object',
                        nullable: true,
                        properties: {
                          formattedArea: {
                            type: 'string',
                            example: 'New York, NY 10001'
                          },
                          id: {
                            type: 'string',
                            example: 'gid://shopify/MailingAddress/123456'
                          },
                          address1: {
                            type: 'string',
                            example: '123 Main St'
                          },
                          address2: {
                            type: 'string',
                            example: 'Apt 4B'
                          },
                          city: {
                            type: 'string',
                            example: 'New York'
                          },
                          countryCode: {
                            type: 'string',
                            example: 'US'
                          },
                          province: {
                            type: 'string',
                            example: 'NY'
                          }
                        }
                      }
                    }
                  },
                  poNumber: {
                    type: 'string',
                    nullable: true,
                    example: 'PO-12345'
                  },
                  purchasingEntity: {
                    type: 'object',
                    properties: {
                      __typename: {
                        type: 'string',
                        enum: ['Customer', 'PurchasingCompany']
                      }
                    },
                    oneOf: [
                      {
                        type: 'object',
                        properties: {
                          __typename: {
                            type: 'string',
                            enum: ['Customer']
                          },
                          id: {
                            type: 'string',
                            example: 'gid://shopify/Customer/123456789'
                          },
                          displayName: {
                            type: 'string',
                            example: 'John Doe'
                          },
                          email: {
                            type: 'string',
                            example: 'john.doe@example.com'
                          },
                          firstName: {
                            type: 'string',
                            example: 'John'
                          },
                          lastName: {
                            type: 'string',
                            example: 'Doe'
                          },
                          fullName: {
                            type: 'string',
                            example: 'John Doe',
                            nullable: true
                          },
                          numberOfOrders: {
                            type: 'number',
                            example: 5
                          },
                          phone: {
                            type: 'string',
                            example: '+1234567890',
                            nullable: true
                          },
                          defaultAddress: {
                            type: 'object',
                            nullable: true,
                            properties: {
                              formattedArea: {
                                type: 'string',
                                example: 'New York, NY 10001'
                              },
                              id: {
                                type: 'string',
                                example: 'gid://shopify/MailingAddress/123456'
                              },
                              address1: {
                                type: 'string',
                                example: '123 Main St'
                              },
                              address2: {
                                type: 'string',
                                example: 'Apt 4B'
                              },
                              city: {
                                type: 'string',
                                example: 'New York'
                              },
                              countryCode: {
                                type: 'string',
                                example: 'US'
                              },
                              province: {
                                type: 'string',
                                example: 'NY'
                              }
                            }
                          }
                        }
                      },
                      {
                        type: 'object',
                        properties: {
                          __typename: {
                            type: 'string',
                            enum: ['PurchasingCompany']
                          },
                          company: {
                            type: 'object',
                            properties: {
                              id: {
                                type: 'string',
                                example: 'gid://shopify/Company/123456'
                              },
                              name: {
                                type: 'string',
                                example: 'ACME Corp'
                              }
                            }
                          },
                          contact: {
                            type: 'object',
                            properties: {
                              id: {
                                type: 'string',
                                example: 'gid://shopify/Contact/123456'
                              },
                              customer: {
                                type: 'object',
                                properties: {
                                  id: {
                                    type: 'string',
                                    example: 'gid://shopify/Customer/123456789'
                                  },
                                  displayName: {
                                    type: 'string',
                                    example: 'John Doe'
                                  },
                                  email: {
                                    type: 'string',
                                    example: 'john.doe@example.com'
                                  },
                                  firstName: {
                                    type: 'string',
                                    example: 'John'
                                  },
                                  lastName: {
                                    type: 'string',
                                    example: 'Doe'
                                  },
                                  fullName: {
                                    type: 'string',
                                    example: 'John Doe',
                                    nullable: true
                                  },
                                  numberOfOrders: {
                                    type: 'number',
                                    example: 5
                                  },
                                  phone: {
                                    type: 'string',
                                    example: '+1234567890',
                                    nullable: true
                                  },
                                  defaultAddress: {
                                    type: 'object',
                                    nullable: true,
                                    properties: {
                                      formattedArea: {
                                        type: 'string',
                                        example: 'New York, NY 10001'
                                      },
                                      id: {
                                        type: 'string',
                                        example: 'gid://shopify/MailingAddress/123456'
                                      },
                                      address1: {
                                        type: 'string',
                                        example: '123 Main St'
                                      },
                                      address2: {
                                        type: 'string',
                                        example: 'Apt 4B'
                                      },
                                      city: {
                                        type: 'string',
                                        example: 'New York'
                                      },
                                      countryCode: {
                                        type: 'string',
                                        example: 'US'
                                      },
                                      province: {
                                        type: 'string',
                                        example: 'NY'
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          location: {
                            type: 'object',
                            properties: {
                              id: {
                                type: 'string',
                                example: 'gid://shopify/Location/123456'
                              },
                              name: {
                                type: 'string',
                                example: 'Main Warehouse'
                              },
                              shippingAddress: {
                                type: 'object',
                                properties: {
                                  formattedArea: {
                                    type: 'string',
                                    example: 'New York, NY 10001'
                                  },
                                  id: {
                                    type: 'string',
                                    example: 'gid://shopify/MailingAddress/123456'
                                  },
                                  address1: {
                                    type: 'string',
                                    example: '123 Main St'
                                  },
                                  address2: {
                                    type: 'string',
                                    example: 'Apt 4B'
                                  },
                                  city: {
                                    type: 'string',
                                    example: 'New York'
                                  },
                                  countryCode: {
                                    type: 'string',
                                    example: 'US'
                                  },
                                  province: {
                                    type: 'string',
                                    example: 'NY'
                                  }
                                }
                              },
                              externalId: {
                                type: 'string',
                                nullable: true,
                                example: 'EXT-123'
                              }
                            }
                          }
                        }
                      }
                    ]
                  },
                  hasTimelineComment: {
                    type: 'boolean',
                    example: false
                  },
                  note2: {
                    type: 'string',
                    nullable: true,
                    example: 'Additional notes about the draft order'
                  },
                  status: {
                    type: 'string',
                    example: 'OPEN'
                  },
                  totalPriceSet: {
                    type: 'object',
                    properties: {
                      shopMoney: {
                        type: 'object',
                        properties: {
                          amount: {
                            type: 'string',
                            example: '100.00'
                          },
                          currencyCode: {
                            type: 'string',
                            example: 'USD'
                          }
                        }
                      },
                      presentmentMoney: {
                        type: 'object',
                        properties: {
                          amount: {
                            type: 'string',
                            example: '100.00'
                          },
                          currencyCode: {
                            type: 'string',
                            example: 'USD'
                          }
                        }
                      }
                    }
                  },
                  updatedAt: {
                    type: 'string',
                    example: '2024-01-01T12:00:00Z'
                  },
                  cursor: {
                    type: 'string',
                    description: 'Cursor for this draft order',
                    example: 'eyJsYXN0X2lkIjo0NTc5MjQxOTk5LCJsYXN0X3ZhbHVlIjoiMjAyMy0wNC0yOFQxNDo0MzowMS0wNDowMCJ9'
                  }
                }
              }
            },
            pagination: {
              type: 'object',
              properties: {
                hasNextPage: {
                  type: 'boolean',
                  example: true
                },
                hasPreviousPage: {
                  type: 'boolean',
                  example: false
                },
                cursor: {
                  type: 'string',
                  example: 'cursor_xyz'
                },
                totalCount: {
                  type: 'number',
                  example: 100
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
            code: {
              type: 'number',
              example: 400
            },
            message: {
              type: 'string',
              example: 'Invalid parameters'
            }
          }
        }
      },
      '500': {
        description: 'Internal server error',
        schema: {
          type: 'object',
          properties: {
            code: {
              type: 'number',
              example: 500
            },
            message: {
              type: 'string',
              example: 'Internal server error'
            }
          }
        }
      }
    }
  };