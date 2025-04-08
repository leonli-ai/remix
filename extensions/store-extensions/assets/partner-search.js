document.addEventListener('DOMContentLoaded', function() {
  class PartnerSearch extends PredictiveSearch {
    constructor() {
      super();
      this.companyId = document.querySelector("#partner-search-element").getAttribute("data-id");
      this.appUrl = document.querySelector("#partner-search-element").getAttribute("data-app-url");
      this.debounceTimer = null;
    }

    getProductByPartnerNumber(partnerNumber) {
      return new Promise((resolve, reject) => {
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(() => {
          const myHeaders = new Headers();
          myHeaders.append('accept', 'application/json');
          myHeaders.append('Content-Type', 'application/json');

          const raw = JSON.stringify({
            storeName: window.Shopify.shop,
            companyId: 'gid://shopify/Company/' + this.companyId,
            data: [partnerNumber],
          });

          const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow',
          };

          fetch(
            `${this.appUrl}/api/v1/product-variant/customer-partner-number/fetch`,
            requestOptions,
          )
            .then((response) => response.json())
            .then(resolve)
            .catch(reject);
        }, 300); // 300ms debounce delay
      });
    }

    getSearchResults(searchTerm) {
      super.setLiveRegionLoadingState();
      this.getProductByPartnerNumber(searchTerm)
        .then((data) => {
          const skuId = data.skuDetails?.[0]?.skuId;
          if (!skuId) {
            throw new Error('No product found');
          } else {
            super.getSearchResults(skuId);
          }
        })
        .catch((error) => {
          super.getSearchResults(searchTerm);
        });
    }
  }
  customElements.define('partner-search', PartnerSearch);
});
