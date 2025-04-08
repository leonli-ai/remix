document.addEventListener("DOMContentLoaded", () => {
  const appUrl = document.querySelector("#partner-search-action").getAttribute("data-app-url");
  const id = document.querySelector("#partner-search-action").getAttribute("data-id");
  const storeName = document
    .querySelector("#partner-search-action")
    .getAttribute("data-store");
  const predictSearchElements = document.querySelectorAll('predict-search');
  const searchForms = document.querySelectorAll("predict-search form");
  if (searchForms.length) {
    searchForms.forEach((form) => {
      form.action = appUrl+'/api/v1/product-variant/customer-partner-number/search';
      const hiddenInput = document.createElement("input");
      const hiddenInput2 = document.createElement("input");

      hiddenInput.type = "hidden";
      hiddenInput.name = "companyId";
      hiddenInput.value = id;
      hiddenInput2.name = "storeName";
      hiddenInput2.type = "hidden";
      hiddenInput2.value = storeName;

      form.appendChild(hiddenInput);
      form.appendChild(hiddenInput2);
    });
  }

  // replace predict-search to partner-search
  predictSearchElements.forEach(predictSearch => {
    const partnerSearch = document.createElement('partner-search');

    while (predictSearch.firstChild) {
      partnerSearch.appendChild(predictSearch.firstChild);
    }
    predictSearch.replaceWith(partnerSearch);
  });

});
