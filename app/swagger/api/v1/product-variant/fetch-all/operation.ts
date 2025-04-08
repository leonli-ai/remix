export const fetchProductVariantsOperation = {
  tags: ['Product Variant'],
  summary: 'Search for products and their variants with filtering based on company location',
  description: 'Retrieve products and their variants that are visible to the specified company location. The query parameter accepts an array of strings that can be either SKU IDs or customer partner numbers.',
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: 'object',
        required: ['query', 'storeName', 'customerId', 'companyLocationId', 'companyId'],
        properties: {
          query: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Array of search queries (SKU IDs or customer partner numbers)',
            example: ['2400', 'K730H']
          },
          storeName: {
            type: 'string',
            description: 'Store domain name',
            example: 'b2b-accelerator.myshopify.com'
          },
          customerId: {
            type: 'string',
            description: 'Customer ID',
            example: 'gid://shopify/Customer/123456'
          },
          companyLocationId: {
            type: 'string',
            description: 'Company location ID',
            example: 'gid://shopify/CompanyLocation/6766264540'
          },
          companyId: {
            type: 'string',
            description: 'Company ID',
            example: 'gid://shopify/Company/123456'
          }
        }
      }
    }
  ],
  responses: {
    '200': {
      description: 'Successfully retrieved products',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'number',
            example: 200
          },
          message: {
            type: 'string',
            example: 'Products fetched successfully'
          },
          products: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: 'gid://shopify/Product/123456'
                },
                title: {
                  type: 'string',
                  example: 'Sample Product'
                },
                description: {
                  type: 'string',
                  example: 'Product description'
                },
                handle: {
                  type: 'string',
                  example: 'sample-product'
                },
                onlineStoreUrl: {
                  type: 'string',
                  nullable: true,
                  example: 'https://store.myshopify.com/products/sample-product'
                },
                images: {
                  type: 'object',
                  properties: {
                    nodes: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'string',
                            example: 'gid://shopify/ProductImage/123456'
                          },
                          url: {
                            type: 'string',
                            example: 'https://cdn.shopify.com/image.jpg'
                          }
                        }
                      }
                    }
                  }
                },
                updatedAt: {
                  type: 'string',
                  example: '2024-02-13T12:00:00Z'
                },
                variants: {
                  type: 'object',
                  properties: {
                    nodes: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'string',
                            example: 'gid://shopify/ProductVariant/123456'
                          },
                          title: {
                            type: 'string',
                            example: 'Default Title'
                          },
                          sku: {
                            type: 'string',
                            example: 'SKU-001'
                          },
                          availableForSale: {
                            type: 'boolean',
                            example: true
                          },
                          sellableOnlineQuantity: {
                            type: 'number',
                            nullable: true,
                            example: 100
                          },
                          contextualPricing: {
                            type: 'object',
                            nullable: true,
                            properties: {
                              price: {
                                type: 'object',
                                nullable: true,
                                properties: {
                                  amount: {
                                    type: 'string',
                                    example: '29.99'
                                  },
                                  currencyCode: {
                                    type: 'string',
                                    example: 'USD'
                                  }
                                }
                              },
                              quantityRule: {
                                type: 'object',
                                nullable: true,
                                properties: {
                                  minimum: {
                                    type: 'number',
                                    nullable: true,
                                    example: 1
                                  },
                                  maximum: {
                                    type: 'number',
                                    nullable: true,
                                    example: 100
                                  },
                                  increment: {
                                    type: 'number',
                                    nullable: true,
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
          },
          error: {
            type: 'boolean',
            example: true
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Query is required'
                }
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
          code: {
            type: 'number',
            example: 500
          },
          message: {
            type: 'string',
            example: 'Internal server error'
          },
          error: {
            type: 'boolean',
            example: true
          }
        }
      }
    }
  }
}; 