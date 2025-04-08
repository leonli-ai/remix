/**
 * Swagger API documentation for the subscription contract create endpoint
 */
export const createSubscriptionContractOperation = {
  tags: ["Subscription Contracts"],
  summary: "Create Subscription Contract",
  description: "Create a new subscription contract with lines and return the contract ID. The contract is created with a 'pending' status initially.",
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: "object",
        required: ["storeName", "companyId", "companyLocationId", "customerId", "subscription"],
        properties: {
          storeName: {
            type: "string",
            description: "Store name for multi-tenant identification",
            example: "demo.myshopify.com"
          },
          companyId: {
            type: "string",
            description: "Shopify Company ID",
            example: "gid://shopify/Company/12345"
          },
          companyLocationId: {
            type: "string",
            description: "Shopify Company Location ID",
            example: "gid://shopify/CompanyLocation/67890"
          },
          customerId: {
            type: "string",
            description: "Shopify Customer ID",
            example: "gid://shopify/Customer/54321"
          },
          subscription: {
            type: "object",
            required: [
              "name",
              "currencyCode",
              "startDate",
              "endDate",
              "intervalValue",
              "intervalUnit",
              "shippingMethod",
              "shippingCost",
              "createdById",
              "contactId",
              "items"
            ],
            properties: {
              name: {
                type: "string",
                description: "Subscription contract name",
                example: "Office Supplies Monthly"
              },
              note: {
                type: "string",
                description: "Optional notes for the subscription",
                example: "Deliver before noon"
              },
              poNumber: {
                type: "string",
                description: "Purchase Order number",
                example: "PO-12345"
              },
              currencyCode: {
                type: "string",
                description: "ISO currency code (e.g., USD)",
                example: "USD"
              },
              startDate: {
                type: "string",
                description: "Start date in YYYY-MM-DD format",
                example: "2024-01-01"
              },
              endDate: {
                type: "string",
                description: "End date in YYYY-MM-DD format",
                example: "2024-12-31"
              },
              intervalValue: {
                type: "integer",
                description: "Frequency value (e.g., 2 for every 2 weeks)",
                example: 1
              },
              intervalUnit: {
                type: "string",
                enum: [
                  "daily", 
                  "weekly", "weeks",
                  "monthly", "months",
                  "quarterly",
                  "biannual",
                  "annually", "yearly"
                ],
                description: "Frequency unit",
                example: "months"
              },
              deliveryAnchor: {
                type: "integer",
                minimum: 1,
                maximum: 31,
                description: "Day of delivery (1-7 for weekly, 1-31 for monthly)",
                example: 15
              },
              discountType: {
                type: "string",
                enum: ["percentage", "amount", "fixed_price"],
                nullable: true,
                description: "Discount type if applicable",
                example: "percentage"
              },
              discountValue: {
                type: "number",
                nullable: true,
                description: "Discount value if applicable",
                example: 10
              },
              shippingMethod: {
                type: "string",
                description: "Shipping method name or description",
                example: "Standard Shipping"
              },
              shippingMethodId: {
                type: "string",
                description: "Shopify shipping method/delivery method ID",
                example: "gid://shopify/DeliveryMethod/123"
              },
              shippingCost: {
                type: "number",
                description: "Shipping cost",
                example: 12.50
              },
              createdById: {
                type: "string",
                description: "Shopify CustomerContact ID of creator",
                example: "gid://shopify/CustomerContact/111"
              },
              contactId: {
                type: "string",
                description: "Shopify CompanyContact ID of business contact",
                example: "gid://shopify/CompanyContact/222"
              },
              items: {
                type: "array",
                minItems: 1,
                items: {
                  type: "object",
                  required: ["variantId", "sku", "quantity", "price"],
                  properties: {
                    variantId: {
                      type: "string",
                      description: "Shopify Variant GID",
                      example: "gid://shopify/ProductVariant/9876"
                    },
                    sku: {
                      type: "string",
                      description: "Product SKU",
                      example: "PAPER-001"
                    },
                    quantity: {
                      type: "integer",
                      description: "Quantity",
                      example: 5
                    },
                    price: {
                      type: "number",
                      description: "Price per unit",
                      example: 24.99
                    },
                    customerPartnerNumber: {
                      type: "string",
                      description: "Customer's internal product code",
                      example: "CPN-123"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  ],
  security: [{ bearerAuth: [] }],
  responses: {
    "200": {
      description: "Subscription contract created successfully",
      schema: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            description: "Whether the operation was successful",
            example: true
          },
          subscriptionContractId: {
            type: "integer",
            description: "ID of the created subscription contract",
            example: 2001
          },
          status: {
            type: "string",
            description: "Initial status of the subscription contract",
            example: "pending"
          }
        }
      }
    },
    "400": {
      description: "Bad Request"
    },
    "401": {
      description: "Unauthorized"
    },
    "403": {
      description: "Forbidden"
    },
    "404": {
      description: "Not Found"
    },
    "500": {
      description: "Internal Server Error"
    }
  }
}; 