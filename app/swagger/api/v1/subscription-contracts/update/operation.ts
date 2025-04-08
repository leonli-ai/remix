/**
 * Swagger API documentation for the subscription contract update endpoint
 */
export const updateSubscriptionContractOperation = {
  tags: ["Subscription Contracts"],
  summary: "Update Subscription Contract",
  description: "Update an existing subscription contract with new data including line items. The endpoint uses a full replacement strategy for line items, deleting existing ones and creating new ones.",
  parameters: [
    {
      name: 'body',
      in: 'body',
      required: true,
      schema: {
        type: "object",
        required: ["storeName", "subscriptionContractId", "data"],
        properties: {
          storeName: {
            type: "string",
            description: "Store name for multi-tenant identification",
            example: "demo.myshopify.com"
          },
          subscriptionContractId: {
            type: "integer",
            description: "ID of the subscription contract to update",
            example: 2001
          },
          companyLocationId: {
            type: "string",
            description: "Shopify Company Location ID (optional)",
            example: "gid://shopify/CompanyLocation/123456"
          },
          customerId: {
            type: "string",
            description: "Shopify Customer ID who owns the subscription (optional)",
            example: "gid://shopify/Customer/1"
          },
          data: {
            type: "object",
            required: [
              "name",
              "startDate",
              "endDate",
              "intervalValue",
              "intervalUnit",
              "shippingMethodName",
              "shippingCost",
              "lines"
            ],
            properties: {
              name: {
                type: "string",
                description: "Updated subscription contract name",
                example: "Updated Office Supplies Subscription"
              },
              note: {
                type: "string",
                description: "Optional notes for the subscription",
                example: "Update PO and shipping method"
              },
              poNumber: {
                type: "string",
                description: "Purchase Order number",
                example: "NEW-PO-789"
              },
              startDate: {
                type: "string",
                format: "date",
                description: "Start date in YYYY-MM-DD format",
                example: "2025-04-01"
              },
              endDate: {
                type: "string",
                format: "date",
                description: "End date in YYYY-MM-DD format",
                example: "2025-12-01"
              },
              intervalValue: {
                type: "integer",
                description: "Frequency value (e.g., 2 for every 2 weeks)",
                example: 2
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
                example: "weeks"
              },
              deliveryAnchor: {
                type: "integer",
                minimum: 1,
                maximum: 31,
                description: "Day of delivery (1-7 for weekly, 1-31 for monthly)",
                example: 15
              },
              shippingMethodId: {
                type: "string",
                description: "ID of the shipping method",
                example: "gid://shopify/DeliveryMethod/standard"
              },
              shippingMethodName: {
                type: "string",
                description: "Name of the shipping method",
                example: "Standard 3–5 Days"
              },
              shippingCost: {
                type: "number",
                description: "Shipping cost",
                example: 20.0
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
              orderTotal: {
                type: "number",
                description: "Total order amount including shipping (optional)",
                example: 1860.00
              },
              lines: {
                type: "array",
                minItems: 1,
                description: "Line items for the subscription",
                items: {
                  type: "object",
                  required: ["variantId", "sku", "quantity", "price"],
                  properties: {
                    id: {
                      type: "integer",
                      description: "Line item ID (optional)",
                      example: 90001
                    },
                    variantId: {
                      type: "string",
                      description: "Shopify Variant GID",
                      example: "gid://shopify/ProductVariant/101"
                    },
                    sku: {
                      type: "string",
                      description: "Product SKU",
                      example: "SKU-101"
                    },
                    quantity: {
                      type: "integer",
                      description: "Quantity",
                      example: 3
                    },
                    price: {
                      type: "number",
                      description: "Price per unit",
                      example: 180.0
                    },
                    customerPartnerNumber: {
                      type: "string",
                      description: "Customer's internal product code",
                      example: "CPN-001"
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
      description: "Subscription contract updated successfully",
      schema: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true
          },
          subscriptionContractId: {
            type: "integer",
            example: 2001
          },
          message: {
            type: "string",
            example: "Subscription contract updated successfully"
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