import type { SwaggerUIProps } from 'swagger-ui-react';
import { skuLookupOperation } from './api/v1/product-variant/customer-partner-number/search/opeartion';
import { fetchListOperation } from './api/v1/shopping-lists/fetch-all/opeartion';
import { fetchListByIdOperation } from './api/v1/shopping-lists/id/items/fetch/opeartion';
import { patchShoppingListByIdOperation } from './api/v1/shopping-lists/id/update/opeartion';
import { createShoppingListOperation } from './api/v1/shopping-lists/create/opeartion';
import { updateShoppingListItemOperation } from './api/v1/shopping-lists/id/items/patch/opeartion';
import { deleteShoppingListOperation } from './api/v1/shopping-lists/id/delete/opeartion';
import { deleteShoppingListItemOperation } from './api/v1/shopping-lists/id/items/delete/opeartion';
import { shoppingListItemsAggregationOperation } from './api/v1/shopping-lists/id/items/aggregation/operation';
import { skuListLookupOperation } from './api/v1/product-variant/customer-partner-number/fetch/opeartion';
import { createUserOperation } from './api/v1/company-management/company-contact/create/operation';
import { getRoleListOperation } from './api/v1/company-management/contact-role-management/list/operation';
import { createRoleOperation } from './api/v1/company-management/contact-role-management/create/opertaion';
import { deleteRoleOperation } from './api/v1/company-management/contact-role-management/delete/opertaion';
import { getCompanyContactListOperation } from './api/v1/company-management/company-contact/fetch-all/operation';
import { deleteCompanyContactOperation } from './api/v1/company-management/company-contact/delete/operation';
import { assignRoleOperation } from './api/v1/company-management/contact-role-management/role-assign/operation';
import { getCompanyContactByIdOperation } from './api/v1/company-management/company-contact/get-by-id/operation';
import { fetchAllLocationsOperation } from './api/v1/company-management/company-location/fetch-all/operation';
import { fetchDraftOrdersOperation } from './api/v1/order-management/draft-orders/fetch-all/operation';
import { getDraftOrderDetailsOperation } from './api/v1/order-management/draft-orders/details/operation';
import { getCustomerDetailsOperation } from './api/v1/customer-management/customer/get-by-id/operation';
import { approveDraftOrderOperation } from './api/v1/order-management/draft-orders/approve/operation';
import { rejectDraftOrderOperation } from './api/v1/order-management/draft-orders/reject/operation';
import { bulkDeleteDraftOrdersOperation } from './api/v1/order-management/draft-orders/bulk-delete/operation';
import { customerPartnerNumberBySkuOperation } from './api/v1/product-variant/customer-partner-number/get-by-sku/opeartion';
import { fetchOrdersOperation } from './api/v1/order-management/order/fetch-all/operation';
import { fetchAllStoreCompanyMappingOperation } from './api/v1/product-variant/customer-partner-number/fetch-all/operation';
import { bulkDeleteMappingOperation } from './api/v1/product-variant/customer-partner-number/bulk-delete/operation';
import { uploadOperation } from './api/v1/product-variant/customer-partner-number/upload/operation';
import { exportMappingOperation } from './api/v1/product-variant/customer-partner-number/export/operation';
import { getOrderByIdOperation } from './api/v1/order-management/order/get-by-id/operation';
import { exportPriceListOperation } from './api/v1/product-variant/price-list/export/operation';
import { getVariantPricesOperation } from './api/v1/product-variant/variant-prices/operation';
import { fetchProductVariantsOperation } from './api/v1/product-variant/fetch-all/operation';
import { fetchQuotesOperation } from './api/v1/quotes/fetch-all/operation';
import { getQuoteByIdOperation } from './api/v1/quotes/get-by-id/operation';
import { createQuoteOperation } from './api/v1/quotes/create/operation';
import { fetchDraftQuotesOperation } from './api/v1/quotes/draft/fetch-all/operation';
import { createDraftQuoteOperation } from './api/v1/quotes/draft/create/operation';
import { getDraftQuoteOperation } from './api/v1/quotes/draft/get-by-id/operation';
import { submitDraftQuoteOperation } from './api/v1/quotes/draft/submit/operation';
import { rejectQuoteOperation } from './api/v1/quotes/reject/operation';
import { approveQuoteOperation } from './api/v1/quotes/approve/operation';
import { bulkDeleteQuotesOperation } from './api/v1/quotes/bulk-delete/operation';
import { updateQuoteItemsOperation } from './api/v1/quotes/items/update/operation';
import { bulkDeleteDraftQuotesOperation } from './api/v1/quotes/draft/bulk-delete/operation';
import { updateDraftQuoteItemsOperation } from './api/v1/quotes/draft/items/update/operation';
import { convertQuoteToOrderOperation } from './api/v1/quotes/convert-to-order/operation';
import { cancelQuoteOperation } from './api/v1/quotes/cancel/operation';
import { expireQuoteOperation } from './api/v1/quotes/expire/operation';
import { scanExpiredOperation } from './api/v1/quotes/scan-expired/operation';
import { purchaseOrderParseOperation } from './api/v1/purchase-order/parse/operation';
import { purchaseOrderUploadOperation } from './api/v1/purchase-order/upload/operation';
import { createOrderOperation } from './api/v1/order-management/order/create/operation';
import { fetchShippingMethodsOperation } from './api/v1/shipping-methods/fetch-all/operation';
import { fetchSubscriptionContractsOperation } from './api/v1/subscription-contracts/fetch-all/operation';
import { createSubscriptionContractOperation } from './api/v1/subscription-contracts/create/operation';
import { getSubscriptionContractByIdOperation } from './api/v1/subscription-contracts/get-by-id/operation';
import { updateSubscriptionContractOperation } from './api/v1/subscription-contracts/update/operation';
import { skipSubscriptionContractOperation } from './api/v1/subscription-contracts/skip/operation';
import { pauseSubscriptionContractOperation } from './api/v1/subscription-contracts/pause/operation';
import { resumeSubscriptionContractOperation } from './api/v1/subscription-contracts/resume/operation';
import { deleteSubscriptionContractOperation } from './api/v1/subscription-contracts/delete/operation';
import { approveSubscriptionContractOperation } from './api/v1/subscription-contracts/approve/operation';
import { declineSubscriptionContractOperation } from './api/v1/subscription-contracts/decline/operation';

export const swaggerConfig: SwaggerUIProps['spec'] = {
  swagger: '2.0',
  info: {
    title: 'Shopify RDS API',
    description: 'API for Shopify RDS',
    version: '1.0.0'
  },
  basePath: '/api/v1',
  schemes: ['http', 'https'],
  produces: ['application/json'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization'
    }
  },

  paths: {
    '/product-variant/customer-partner-number/search': {
      get: skuLookupOperation
    },
    '/product-variant/customer-partner-number/fetch': {
      post: skuListLookupOperation
    },
    '/product-variant/customer-partner-number/get-by-sku': {
      post: customerPartnerNumberBySkuOperation
    },
    '/product-variant/customer-partner-number/upload': {
      post: uploadOperation
    },
    '/product-variant/customer-partner-number/fetch-all': {
      post: fetchAllStoreCompanyMappingOperation
    },
    '/product-variant/customer-partner-number/bulk-delete': {
      post: bulkDeleteMappingOperation
    },
    '/product-variant/customer-partner-number/export': {
      post: exportMappingOperation
    },
    '/product-variant/price-list/export': {
      post: exportPriceListOperation
    },
    '/product-variant/price/get-by-ids': {
      post: getVariantPricesOperation
    },
    '/product-variant/fetch-all': {
      post: fetchProductVariantsOperation
    },
    '/shopping-lists/fetch-all': {
      post: fetchListOperation
    },
    '/shopping-lists/create': {
      post: createShoppingListOperation,
    },
    '/shopping-lists/{id}/delete':{
      post: deleteShoppingListOperation
    },
    '/shopping-lists/{id}/update': {
      post: patchShoppingListByIdOperation,
    },

    '/shopping-lists/{id}/items/fetch': {
      post: fetchListByIdOperation,

    },
    '/shopping-lists/{id}/items/delete': {
      post: deleteShoppingListItemOperation
    }
    , '/shopping-lists/{id}/items/patch': {
      post: updateShoppingListItemOperation,
    },
    '/shopping-lists/{id}/items/aggregation': {
      post: shoppingListItemsAggregationOperation
    },
    '/company-management/company-location/fetch-all': {
      post: fetchAllLocationsOperation
    },
    '/company-management/company-contact/create': {
      post: createUserOperation,
    },
    '/company-management/company-contact/fetch-all': {
      post: getCompanyContactListOperation
    },
    '/company-management/company-contact/get-by-id': {
      post: getCompanyContactByIdOperation,
    },

    '/company-management/company-contact/delete': {
      post: deleteCompanyContactOperation
    },

    '/company-management/contact-role-management/fetch-all': {
        post: getRoleListOperation,
    },
    '/company-management/contact-role-management/create': {
        post: createRoleOperation,
    },
    '/company-management/contact-role-management/{id}/delete': {
      post: deleteRoleOperation
    },
    '/company-management/contact-role-management/role-assign': {
      post: assignRoleOperation
    },
    '/order-management/draft-order/fetch-all': {
      post: fetchDraftOrdersOperation
    },
    '/order-management/draft-order/get-by-id': {
      post: getDraftOrderDetailsOperation
    }, '/customer-management/customer/get-by-id': {
      post: getCustomerDetailsOperation
    },
    '/order-management/draft-order/approve': {
      post: approveDraftOrderOperation
    },
    '/order-management/draft-order/reject': {
      post: rejectDraftOrderOperation
    },
    '/order-management/draft-order/bulk-delete': {
      post: bulkDeleteDraftOrdersOperation
    },
    '/order-management/order/fetch-all': {
      post: fetchOrdersOperation
    },
    '/order-management/order/get-by-id': {
      post: getOrderByIdOperation
    },
    '/order-management/order/create': {
      post: createOrderOperation
    },
    

    '/quotes/approve': {
      post: approveQuoteOperation
    },
    '/quotes/bulk-delete': {
      post: bulkDeleteQuotesOperation
    },
    '/quotes/create': {
      post: createQuoteOperation
    },
    '/quotes/convert-to-order': {
      post: convertQuoteToOrderOperation
    },
    '/quotes/fetch-all': {
      post: fetchQuotesOperation
    },
    '/quotes/get-by-id': {
      post: getQuoteByIdOperation
    },
    '/quotes/items/update': {
      post: updateQuoteItemsOperation
    },
    '/quotes/reject': {
      post: rejectQuoteOperation
    },
    '/quotes/cancel': {
      post: cancelQuoteOperation
    },
    '/quotes/expire': {
      post: expireQuoteOperation
    },
    '/quotes/draft/create': {
      post: createDraftQuoteOperation
    },
    '/quotes/draft/fetch-all': {
      post: fetchDraftQuotesOperation
    },
    '/quotes/draft/get-by-id': {
      post: getDraftQuoteOperation
    },
    '/quotes/draft/submit': {
      post: submitDraftQuoteOperation
    },
    '/quotes/draft/bulk-delete': {
      post: bulkDeleteDraftQuotesOperation
    },
    '/quotes/draft/items/update': {
      post: updateDraftQuoteItemsOperation
    },
    '/quotes/scan-expired': {
      post: scanExpiredOperation
    },
    '/purchase-order/parse': {
      post: purchaseOrderParseOperation
    },
    '/purchase-order/upload': {
      post: purchaseOrderUploadOperation
    },
    '/shipping-methods/fetch-all': {
      post: fetchShippingMethodsOperation
    },
    '/subscription-contracts/fetch-all': {
      post: fetchSubscriptionContractsOperation
    },
    '/subscription-contracts/create': {
      post: createSubscriptionContractOperation
    },
    '/subscription-contracts/get-by-id': {
      post: getSubscriptionContractByIdOperation
    },
    '/subscription-contracts/update': {
      post: updateSubscriptionContractOperation
    },
    '/subscription-contracts/skip': {
      post: skipSubscriptionContractOperation
    },
    '/subscription-contracts/pause': {
      post: pauseSubscriptionContractOperation
    },
    '/subscription-contracts/resume': {
      post: resumeSubscriptionContractOperation
    },
    '/subscription-contracts/delete': {
      post: deleteSubscriptionContractOperation
    },
    '/subscription-contracts/approve': {
      post: approveSubscriptionContractOperation
    },
    '/subscription-contracts/decline': {
      post: declineSubscriptionContractOperation
    }
  }
};

