export const getDraftOrderDetailsOperation = {
  tags: ['Order Management'],
  summary: 'Get draft order details',
  description: 'Retrieves detailed information about a specific draft order',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'customerId', 'draftOrderId', 'companyLocationId'],
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
          draftOrderId: {
            type: 'string',
            description: 'ID of the draft order',
            example: 'gid://shopify/DraftOrder/123456'
          },
          companyLocationId: {
            type: 'string',
            description: 'ID of the company location',
            example: 'gid://shopify/CompanyLocation/789012'
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Successfully retrieved draft order details',
      schema: {
        type: 'object',
        properties: {
          draftOrder: {
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
              province: {
                type: 'string',
                example: 'Ontario'
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
                  }
                }
              },
              shippingLine: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: 'gid://shopify/ShippingLine/123'
                  },
                  title: {
                    type: 'string',
                    example: 'Standard Shipping'
                  },
                  code: {
                    type: 'string',
                    example: 'STANDARD'
                  },
                  customShippingInputPrice: {
                    type: 'object',
                    properties: {
                      amount: {
                        type: 'string',
                        example: '10.00'
                      },
                      currencyCode: {
                        type: 'string',
                        example: 'USD'
                      }
                    }
                  },
                  discountedPriceSet: {
                    type: 'object',
                    properties: {
                      presentmentMoney: {
                        type: 'object',
                        properties: {
                          amount: {
                            type: 'string',
                            example: '8.00'
                          },
                          currencyCode: {
                            type: 'string',
                            example: 'USD'
                          }
                        }
                      },
                      shopMoney: {
                        type: 'object',
                        properties: {
                          amount: {
                            type: 'string',
                            example: '8.00'
                          },
                          currencyCode: {
                            type: 'string',
                            example: 'USD'
                          }
                        }
                      }
                    }
                  },
                  originalPriceSet: {
                    type: 'object',
                    properties: {
                      presentmentMoney: {
                        type: 'object',
                        properties: {
                          amount: {
                            type: 'string',
                            example: '10.00'
                          },
                          currencyCode: {
                            type: 'string',
                            example: 'USD'
                          }
                        }
                      },
                      shopMoney: {
                        type: 'object',
                        properties: {
                          amount: {
                            type: 'string',
                            example: '10.00'
                          },
                          currencyCode: {
                            type: 'string',
                            example: 'USD'
                          }
                        }
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
                  firstName: {
                    type: 'string',
                    example: 'John'
                  },
                  lastName: {
                    type: 'string',
                    example: 'Doe'
                  },
                  displayName: {
                    type: 'string',
                    example: 'John Doe'
                  },
                  email: {
                    type: 'string',
                    example: 'john.doe@example.com'
                  },
                  numberOfOrders: {
                    type: 'number',
                    example: 5
                  },
                  companyContactProfiles: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        company: {
                          type: 'object',
                          properties: {
                            locations: {
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
                                          id: {
                                            type: 'string',
                                            example: 'gid://shopify/CompanyLocation/123456'
                                          },
                                          name: {
                                            type: 'string',
                                            example: 'Main Office'
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
                  __typename: {
                    type: 'string',
                    example: 'Customer'
                  }
                }
              },
              rejectedBy: {
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
                  displayName: {
                    type: 'string',
                    example: 'John Doe'
                  },
                  email: {
                    type: 'string',
                    example: 'john.doe@example.com'
                  },
                  numberOfOrders: {
                    type: 'number',
                    example: 5
                  },
                  companyContactProfiles: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        company: {
                          type: 'object',
                          properties: {
                            locations: {
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
                                          id: {
                                            type: 'string',
                                            example: 'gid://shopify/CompanyLocation/123456'
                                          },
                                          name: {
                                            type: 'string',
                                            example: 'Main Office'
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
                  __typename: {
                    type: 'string',
                    example: 'Customer'
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
                  firstName: {
                    type: 'string',
                    example: 'John'
                  },
                  lastName: {
                    type: 'string',
                    example: 'Doe'
                  },
                  displayName: {
                    type: 'string',
                    example: 'John Doe'
                  },
                  email: {
                    type: 'string',
                    example: 'john.doe@example.com'
                  },
                  numberOfOrders: {
                    type: 'number',
                    example: 5
                  },
                  companyContactProfiles: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        company: {
                          type: 'object',
                          properties: {
                            locations: {
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
                                          id: {
                                            type: 'string',
                                            example: 'gid://shopify/CompanyLocation/123456'
                                          },
                                          name: {
                                            type: 'string',
                                            example: 'Main Office'
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
                  __typename: {
                    type: 'string',
                    example: 'Customer'
                  }
                }
              },
              lineItems: {
                type: 'object',
                properties: {
                  edges: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        cursor: {
                          type: 'string',
                          example: 'cursor_xyz'
                        },
                        node: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'string',
                              example: 'gid://shopify/DraftOrderLineItem/123'
                            },
                            uuid: {
                              type: 'string',
                              example: 'uuid-xyz'
                            },
                            appliedDiscount: {
                              type: 'object',
                              properties: {
                                amountSet: {
                                  $ref: '#/definitions/PriceSet'
                                },
                                value: {
                                  type: 'string',
                                  example: '10.00'
                                },
                                valueType: {
                                  type: 'string',
                                  example: 'FIXED_AMOUNT'
                                },
                                description: {
                                  type: 'string',
                                  example: 'Discount description'
                                }
                              }
                            },
                            product: {
                              type: 'object',
                              properties: {
                                id: {
                                  type: 'string',
                                  example: 'gid://shopify/Product/123'
                                },
                                title: {
                                  type: 'string',
                                  example: 'Product Name'
                                },
                                totalVariants: {
                                  type: 'number',
                                  example: 2
                                }
                              }
                            },
                            variant: {
                              type: 'object',
                              properties: {
                                price: {
                                  type: 'string',
                                  example: '100.00'
                                },
                                contextualPricing: {
                                  type: 'object',
                                  properties: {
                                    price: {
                                      type: 'object',
                                      properties: {
                                        amount: {
                                          type: 'string',
                                          example: '90.00'
                                        }
                                      }
                                    }
                                  }
                                },
                                metafield: {
                                  type: 'object',
                                  properties: {
                                    value: {
                                      type: 'string',
                                      example: 'PCS'
                                    },
                                    key: {
                                      type: 'string',
                                      example: 'uom'
                                    },
                                    namespace: {
                                      type: 'string',
                                      example: 'custom'
                                    }
                                  }
                                }
                              }
                            },
                            image: {
                              type: 'object',
                              properties: {
                                id: {
                                  type: 'string',
                                  description: 'Image ID',
                                  example: 'gid://shopify/ProductImage/123456'
                                },
                                altText: {
                                  type: 'string',
                                  description: 'Alternative text for the image',
                                  example: 'Product front view'
                                },
                                transformedSrc: {
                                  type: 'string',
                                  description: 'Transformed image URL with specified dimensions',
                                  example: 'https://cdn.shopify.com/...'
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
              },
              purchasingEntity: {
                type: 'object',
                properties: {
                  location: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                        description: 'Company location ID',
                        example: 'gid://shopify/CompanyLocation/6559891676'
                      },
                      name: {
                        type: 'string',
                        description: 'Company location name',
                        example: '12345 West 85th Street North'
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
    '404': {
      description: 'Draft order not found',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'number',
            example: 404
          },
          message: {
            type: 'string',
            example: 'Draft order not found'
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