export const METAFIELD_DEFINITIONS = [
  // {
  //   name: "AppUrl",
  //   namespace: "aaxis_streamline",
  //   key: "aaxis_streamline_appUrl",
  //   type: "single_line_text_field",
  //   description: "app url",
  //   ownerType: "SHOP",
  //   access: {
  //     admin: "MERCHANT_READ_WRITE",
  //     storefront: "PUBLIC_READ",
  //     customerAccount: "READ",
  //   },
  //   capabilities: {
  //     smartCollectionCondition: {
  //       enabled: true,
  //     },
  //     adminFilterable: {
  //       enabled: true,
  //     },
  //   },
  // },
  {
    name: "AppUrl",
    namespace: "$app:aaxis_streamline",
    key: "aaxis_streamline_appUrl",
    type: "single_line_text_field",
    description: "app url",
    ownerType: "SHOP",
    access: {
      admin: "MERCHANT_READ_WRITE",
      storefront: "PUBLIC_READ",
      customerAccount: "READ",
    },
    capabilities: {
      smartCollectionCondition: {
        enabled: true,
      },
      adminFilterable: {
        enabled: true,
      },
    },
  },
  {
    name: "Featured",
    namespace: "$app:custom",
    key: "featured",
    type: "boolean",
    description: "Featured Products flag",
    ownerType: "PRODUCT",
    access: {
      admin: "MERCHANT_READ_WRITE",
      storefront: "PUBLIC_READ",
      customerAccount: "READ_WRITE",
    },
    capabilities: {
      smartCollectionCondition: {
        enabled: true,
      },
      adminFilterable: {
        enabled: true,
      },
    },
  },
  {
    name: "Featured Plumbing",
    namespace: "$app:custom",
    key: "featured_plumbing",
    type: "boolean",
    description: "Featured Plumbing Products flag",
    ownerType: "PRODUCT",
    access: {
      admin: "MERCHANT_READ_WRITE",
      storefront: "PUBLIC_READ",
      customerAccount: "READ_WRITE",
    },
    capabilities: {
      smartCollectionCondition: {
        enabled: true,
      },
      adminFilterable: {
        enabled: true,
      },
    },
  },
  {
    name: "Featured",
    namespace: "$app:custom",
    key: "featured",
    type: "boolean",
    description: "Featured Category flag",
    ownerType: "COLLECTION",
    access: {
      admin: "MERCHANT_READ_WRITE",
      storefront: "PUBLIC_READ",
      customerAccount: "NONE",
    },
  },
  {
    name: "draftOrder",
    namespace: "$app:custom",
    key: "draft_order",
    type: "json",
    description: "draftOrder info",
    ownerType: "ORDER",
    access: {
      admin: "MERCHANT_READ_WRITE",
      storefront: "NONE",
      customerAccount: "READ_WRITE",
    },
  },
  {
    name: "operatorInfo",
    namespace: "$app:custom",
    key: "operator_info",
    type: "json",
    description: "operator info",
    ownerType: "DRAFTORDER",
    access: {
      admin: "MERCHANT_READ_WRITE",
      storefront: "PUBLIC_READ",
      customerAccount: "READ_WRITE",
    },
  },
  {
    name: "UOM",
    namespace: "$app:custom",
    key: "custom_uom",
    type: "single_line_text_field",
    description: "UOM info",
    ownerType: "PRODUCTVARIANT",
    access: {
      admin: "MERCHANT_READ_WRITE",
      storefront: "PUBLIC_READ",
      customerAccount: "READ_WRITE",
    },
    capabilities: {
      smartCollectionCondition: {
        enabled: true,
      },
    },
  },
  {
    name: "Specifications",
    namespace: "$app:custom",
    key: "custom_specifications",
    type: "json",
    description: "Specifications info",
    ownerType: "PRODUCTVARIANT",
    access: {
      admin: "MERCHANT_READ_WRITE",
      storefront: "PUBLIC_READ",
      customerAccount: "READ_WRITE",
    },
  },
  {
    name: "Documents",
    namespace: "$app:custom",
    key: "custom_documents",
    type: "list.file_reference",
    description: "Documents info",
    ownerType: "PRODUCT",
    access: {
      admin: "MERCHANT_READ_WRITE",
      storefront: "PUBLIC_READ",
      customerAccount: "READ_WRITE",
    },
  },
  {
    name: "Original Price",
    namespace: "$app:custom",
    key: "custom_original_price",
    type: "number_decimal",
    description: "Original Price info",
    ownerType: "PRODUCTVARIANT",
    access: {
      admin: "MERCHANT_READ_WRITE",
      storefront: "PUBLIC_READ",
      customerAccount: "READ_WRITE",
    },
    capabilities: {
      smartCollectionCondition: {
        enabled: true,
      },
    },
  },
  {
    name: "Material",
    namespace: "$app:custom",
    key: "material",
    type: "json",
    description: "Detailed material information for the product",
    ownerType: "PRODUCTVARIANT",
    access: {
      admin: "MERCHANT_READ_WRITE",
      storefront: "PUBLIC_READ",
      customerAccount: "READ_WRITE",
    },
  },
  {
    name: "Warranty Information",
    namespace: "$app:custom",
    key: "warranty_info",
    type: "json",
    description: "Product warranty information",
    ownerType: "PRODUCTVARIANT",
    access: {
      admin: "MERCHANT_READ_WRITE",
      storefront: "PUBLIC_READ",
      customerAccount: "READ_WRITE",
    },
  },
  {
    name: "Product Badges",
    namespace: "$app:custom",
    key: "product_badges",
    type: "json",
    description: "Product badges for special markings or highlights",
    ownerType: "PRODUCTVARIANT",
    access: {
      admin: "MERCHANT_READ_WRITE",
      storefront: "PUBLIC_READ",
      customerAccount: "READ_WRITE",
    },
  },
  {
    name: "Color",
    namespace: "$app:custom",
    key: "color",
    type: "color",
    description: "Product color with additional information",
    ownerType: "PRODUCTVARIANT",
    access: {
      admin: "MERCHANT_READ_WRITE",
      storefront: "PUBLIC_READ",
      customerAccount: "READ_WRITE",
    },
  },
  {
    name: "Dimensions",
    namespace: "$app:custom",
    key: "dimensions",
    type: "json",
    description: "Product dimensions including length, width, and height",
    ownerType: "PRODUCTVARIANT",
    access: {
      admin: "MERCHANT_READ_WRITE",
      storefront: "PUBLIC_READ",
      customerAccount: "READ_WRITE",
    },
  },
  {
    name: "PO Image Links",
    namespace: "$app:custom",
    key: "custom_po_images_draft_order",
    type: "json",
    description:
      "Stores parsed image links from purchase order processing for draft orders",
    ownerType: "DRAFTORDER",
    access: {
      admin: "MERCHANT_READ_WRITE",
      storefront: "PUBLIC_READ",
      customerAccount: "READ_WRITE",
    },
  },

  {
    name: "PO Image Links",
    namespace: "$app:custom",
    key: "custom_po_images_order",
    type: "json",
    description:
      "Stores parsed image links from purchase order processing for orders",
    ownerType: "ORDER",
    access: {
      admin: "MERCHANT_READ_WRITE",
      storefront: "PUBLIC_READ",
      customerAccount: "READ_WRITE",
    },
  },
];
