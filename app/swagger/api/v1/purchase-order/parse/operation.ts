export const purchaseOrderParseOperation = {
  tags: ['Purchase Order Management'],
  summary: 'Parse a purchase order',
  description: 'Parse and validate a purchase order document. Returns parsed data including customer, company, and product information.',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['storeName', 'fileType'],
        properties: {
          storeName: {
            type: 'string',
            description: 'Name of the store',
            example: 'b2b-accelerator.myshopify.com'
          },
          fileType: {
            type: 'string',
            description: 'Type of the file being parsed',
            enum: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/bmp'],
            example: 'application/pdf'
          },
          file: {
            type: 'string',
            format: 'binary',
            description: 'Base64 encoded file content'
          },
          url: {
            type: 'string',
            format: 'uri',
            description: 'URL of the file to parse',
            example: 'https://example.com/purchase-order.pdf'
          },
          shippingLine: {
            type: 'object',
            description: 'Shipping line information',
            properties: {
              title: {
                type: 'string',
                description: 'Title of the shipping method',
                example: 'Standard Shipping'
              },
              priceWithCurrency: {
                type: 'object',
                description: 'Price information with currency',
                properties: {
                  amount: {
                    type: 'number',
                    description: 'Shipping price amount',
                    example: 10.99
                  },
                  currencyCode: {
                    type: 'string',
                    description: 'Currency code',
                    example: 'USD'
                  }
                }
              }
            }
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Purchase order parsed successfully',
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            example: 'Purchase order parsed successfully'
          },
          data: {
            type: 'object',
            properties: {
              isValid: {
                type: 'boolean',
                description: 'Whether the purchase order is valid',
                example: true
              },
              customer: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: 'gid://shopify/Customer/7850624909532'
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
                    example: 'john@example.com'
                  },
                  phone: {
                    type: 'string',
                    example: null
                  },
                  state: {
                    type: 'string',
                    example: 'ENABLED'
                  }
                }
              },
              companyContactProfiles: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      example: 'gid://shopify/CompanyContact/985596124'
                    },
                    isMainContact: {
                      type: 'boolean',
                      example: false
                    },
                    company: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          example: 'gid://shopify/Company/7660306652'
                        },
                        name: {
                          type: 'string',
                          example: 'ACME Corp'
                        },
                        locations: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: {
                                type: 'string',
                                example: 'gid://shopify/CompanyLocation/7805829340'
                              },
                              name: {
                                type: 'string',
                                example: 'Main Office'
                              },
                              isEditable: {
                                type: 'boolean',
                                example: true
                              },
                              isDefault: {
                                type: 'boolean',
                                example: false
                              },
                              isSelected: {
                                type: 'boolean',
                                example: true
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
                                    example: 'Suite 100'
                                  },
                                  city: {
                                    type: 'string',
                                    example: 'New York'
                                  },
                                  province: {
                                    type: 'string',
                                    example: 'NY'
                                  },
                                  zip: {
                                    type: 'string',
                                    example: '10001'
                                  },
                                  country: {
                                    type: 'string',
                                    example: 'United States'
                                  },
                                  formattedAddress: {
                                    type: 'array',
                                    items: {
                                      type: 'string'
                                    },
                                    example: [
                                      'ACME Corp',
                                      '123 Main St',
                                      'Suite 100',
                                      'New York NY 10001',
                                      'United States'
                                    ]
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    companyContact: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          example: 'gid://shopify/CompanyContact/985596124'
                        },
                        title: {
                          type: 'string',
                          example: 'Purchasing Manager'
                        },
                        locale: {
                          type: 'string',
                          example: 'en-US'
                        }
                      }
                    }
                  }
                }
              },
              products: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      example: 'gid://shopify/Product/8855655776476'
                    },
                    title: {
                      type: 'string',
                      example: 'Product Name'
                    },
                    description: {
                      type: 'string',
                      example: 'Product description'
                    },
                    handle: {
                      type: 'string',
                      example: 'product-handle'
                    },
                    onlineStoreUrl: {
                      type: 'string',
                      example: null
                    },
                    updatedAt: {
                      type: 'string',
                      example: '2024-03-06T02:49:23Z'
                    },
                    image: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          example: 'gid://shopify/ProductImage/42136629608668'
                        },
                        url: {
                          type: 'string',
                          example: 'https://cdn.shopify.com/s/files/1/0731/8031/5868/files/product.webp'
                        }
                      }
                    },
                    variant: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          example: 'gid://shopify/ProductVariant/46067407814876'
                        },
                        sku: {
                          type: 'string',
                          example: '240016'
                        },
                        customerPartnerNumber: {
                          type: 'string',
                          example: 'DFCMFHS1',
                          description: 'Customer partner number for this variant'
                        },
                        quantity: {
                          type: 'integer',
                          example: 1,
                          description: 'Quantity ordered'
                        },
                        title: {
                          type: 'string',
                          example: 'Product Variant Title'
                        },
                        price: {
                          type: 'string',
                          example: '15.95'
                        },
                        currencyCode: {
                          type: 'string',
                          example: 'USD'
                        },
                        inventoryQuantity: {
                          type: 'integer',
                          example: 2000
                        },
                        availableForSale: {
                          type: 'boolean',
                          example: true
                        },
                        customUom: {
                          type: 'string',
                          example: 'each'
                        },
                        quantityRule: {
                          type: 'object',
                          properties: {
                            minimum: {
                              type: 'integer',
                              example: 1
                            },
                            maximum: {
                              type: 'integer',
                              example: null
                            },
                            increment: {
                              type: 'integer',
                              example: 1
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
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            example: 'Invalid file type'
          },
          error: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                example: 'UNSUPPORTED_FILE_TYPE'
              },
              message: {
                type: 'string',
                example: 'File type image/gif is not supported'
              }
            }
          }
        }
      }
    },
    '500': {
      description: 'Internal server error',
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            example: 'Internal server error'
          },
          error: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                example: 'INTERNAL_ERROR'
              },
              message: {
                type: 'string',
                example: 'An unexpected error occurred'
              }
            }
          }
        }
      }
    }
  }
}; 