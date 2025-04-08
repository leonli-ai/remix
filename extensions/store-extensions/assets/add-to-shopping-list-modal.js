const getLocalStorage = (key) => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key) ?? "";
  }
  return "";
};

const extractTypedId = (id, type) => {
  return Number(id.replace(`gid://shopify/${type}/`, ""));
};

const setProductId = (productId) => {
  return `gid://shopify/Product/${productId}`;
};
const setProductVariantId = (productVariantId) => {
  return `gid://shopify/ProductVariant/${productVariantId}`;
};

const shopifyInformation = {
  storeName: getLocalStorage("store-name"),
  shopifyCompanyId: `gid://shopify/Company/${getLocalStorage("company-id")}`,
  shopifyCompanyLocationId: `gid://shopify/CompanyLocation/${getLocalStorage("company-location-id")}`,
  shopifyCustomerId: `gid://shopify/Customer/${getLocalStorage("customer-id")}`,
};

const getProductData = async (handle) => {
  try {
    const productResponse = await fetch(`${handle}.js`);
    const productData = await productResponse.json();

    return { productData };
  } catch (error) {
    console.error("Error fetching product or variant data:", error);
    return null;
  }
};

class ShoppingListModal {
  constructor() {
    this.modal = document.getElementById("shopping-list-modal");
    this.createListModal = document.getElementById("create-list-modal");
    this.addToListButtonText = this.modal.getAttribute(
      "data-add-to-list-button-text",
    );
    this.appUrl = this.modal.getAttribute("data-app-url");
    this.store = this.modal.getAttribute("data-store");

    this.selectedProducts = [];
    this.ids = {
      originalProductId: "",
      originalProductVariantId: "",
    };
    this.selectedLists = new Set();

    this.init();
    this.initProductGridObserver();
    this.initCartItemSelectorObserver();
  }

  async getShoppingLists() {
    const response = await fetch(
      `${this.appUrl}/api/v1/shopping-lists/fetch-all`,
      {
        method: "POST",
        body: JSON.stringify({
          storeName: shopifyInformation.storeName,
          customerId: shopifyInformation.shopifyCustomerId,
          companyLocationId: shopifyInformation.shopifyCompanyLocationId,
          data: {
            sort: [
              {
                field: "isDefault",
                order: "desc",
              },
              {
                field: "updatedAt",
                order: "desc",
              },
            ],
          },
        }),
      },
    );
    const data = await response.json();
    return data;
  }

  async createShoppingList(params) {
    const response = await fetch(
      `${this.appUrl}/api/v1/shopping-lists/create`,
      {
        method: "POST",
        body: JSON.stringify(params),
      },
    );
    const data = await response.json();
    return data;
  }

  async updateShoppingListItems(params) {
    const response = await fetch(
      `${this.appUrl}/api/v1/shopping-lists/${params.shoppingListId}/items/patch`,
      {
        method: "POST",
        body: JSON.stringify(params),
      },
    );
    const data = await response.json();
    return data;
  }

  init() {
    if (!shopifyInformation.shopifyCustomerId) return;

    this.initGetQuickAddModal();
    this.initAddToShoppingListButton();
    this.bindEvents();
    this.bindCreateListFormEvents();
  }

  observeModalChanges(modal) {
    const observer = new MutationObserver(() => {
      this.addButtonAndBindEvents(modal);
    });

    observer.observe(modal, { childList: true, subtree: true });
  }

  initGetQuickAddModal() {
    const quickAddModal = document.getElementsByTagName("quick-add-modal");

    [...quickAddModal].map((modal) => {
      this.observeModalChanges(modal);
    });
  }

  initAddToListBtnTemplate() {
    const btnDom = document.createElement("div");
    btnDom.style.width = "100%";
    btnDom.innerHTML = `
        <button type="button" class="add-to-list-button">Add to List</button>
      `;
    return btnDom;
  }

  addButtonAndBindEvents(modal) {
    const form = modal.querySelector('form[data-type="add-to-cart-form"]');

    if (!form) return;
    const parent = form.parentElement;

    if (!parent) return;

    if (!parent.querySelector(".add-to-list-button")) {
      new AddToListButton(parent, {
        buttonText: this.addToListButtonText,
      });
    }
  }

  initAddToShoppingListButton() {
    const pageForms = document.querySelectorAll(
      'form[data-type="add-to-cart-form"]',
    );

    const parentArray = [...pageForms].map((form) => form.parentElement);

    document.querySelectorAll(".add-to-list-button").forEach((button) => {
      button.parentElement.remove();
    });

    parentArray.forEach((parent) => {
      new AddToListButton(parent, {
        buttonText: this.addToListButtonText,
      });
    });
  }

  bindEvents() {
    const closeButton = this.modal.querySelector(".shopping-list-modal-close");
    const saveButton = document.getElementById("shopping-list-save-to-lists");
    const createNewButton = document.getElementById(
      "shopping-list-create-new-list",
    );

    const newCloseButton = closeButton.cloneNode(true);
    const newSaveButton = saveButton.cloneNode(true);
    const newCreateButton = createNewButton.cloneNode(true);

    closeButton.parentNode.replaceChild(newCloseButton, closeButton);
    saveButton.parentNode.replaceChild(newSaveButton, saveButton);
    createNewButton.parentNode.replaceChild(newCreateButton, createNewButton);

    newCloseButton.addEventListener("click", () => this.close());
    newSaveButton.addEventListener("click", () => this.handleSaveToLists());
    newCreateButton.addEventListener("click", () => this.showCreateListForm());
  }

  resetCheckBoxAndSaveButton() {
    this.selectedLists.clear();
    const btn = document.getElementById("shopping-list-save-to-lists");
    btn.disabled = true;
    // const container = document.getElementById("shopping-lists-container");
    // container.innerHTML = "";
  }

  open() {
    this.renderProducts();
    this.loadShoppingLists();
    this.modal.style.display = "block";
    this.resetCheckBoxAndSaveButton();
  }

  close() {
    this.modal.style.display = "none";

    this.selectedProducts = [];
  }

  formatUrl(url) {
    if (url.split(shopifyInformation.storeName).length > 1) {
      return url.split(shopifyInformation.storeName)[1];
    }
    return url;
  }

  async renderProducts() {
    const checkQuantityRule = (quantity, quantityRule) => {
      const { min = 1, max } = quantityRule;
      if (min) {
        if (quantity < min) {
          return min;
        }
      }
      if (max) {
        if (quantity > max) {
          return max;
        }
      }
      return quantity;
    };
    const updatedProducts = await Promise.all(
      this.selectedProducts.map(async (item) => {
        const productData = await getProductData(item.url);

        const typedId = extractTypedId(item.productVariantId, "ProductVariant");

        const variantData = productData.productData.variants.find(
          (variant) => variant.id === typedId,
        );

        const quantityRule = variantData?.quantity_rule;
        const quantity = checkQuantityRule(item.quantity, quantityRule);

        return {
          ...item,
          quantity,
          productId: setProductId(productData.productData.id),
          productName: productData.productData.title,
          productImageUrl: productData.productData.featured_image || "",
          url: `${shopifyInformation.storeName}${this.formatUrl(item.url)}`,
          skuId: variantData?.sku,
        };
      }),
    );

    this.selectedProducts = updatedProducts;

    const container = document.getElementById(
      "shopping-list-selected-products",
    );
    container.innerHTML = this.selectedProducts
      .map(
        (product) => `
      <div class="shopping-list-product-item">
        ${
          product.productImageUrl
            ? `<img src="${product.productImageUrl}" 
                 alt="${product.productName}"
                 onerror="this.outerHTML='<div class=\'shopping-lists-no-image\'></div>'">`
            : `<div class="shopping-lists-no-image"></div>`
        }
        <span>${product.productName}</span>
      </div>
    `,
      )
      .join("");
  }

  async loadShoppingLists() {
    const spinnerHTML = `<div class="shopping-lists-loading-spinner" style="display: none;">
            <div class="shopping-lists-spinner" style="display: block;"></div>
        </div>`;
    const container = document.getElementById("shopping-lists-container");
    container.innerHTML = spinnerHTML;
    const spinner = container.querySelector(".shopping-lists-loading-spinner");
    const saveButton = document.getElementById("shopping-list-save-to-lists");

    try {
      spinner.style.display = "block";
      const lists = await this.getShoppingLists();

      // if no shopping lists, hide save button and show message
      if (!lists.shoppingLists || lists.shoppingLists.length === 0) {
        saveButton.style.display = "none";
        container.innerHTML = "<p>No shopping lists available.</p>".concat(
          spinnerHTML,
        );
        return;
      }

      // if there are shopping lists, show save button
      saveButton.style.display = "block";

      container.innerHTML = lists.shoppingLists
        .map(
          (list, index) => `
            <div class="shopping-list-item ${index === lists.shoppingLists.length - 1 ? "shopping-list-item-last" : ""}">
                <input type="checkbox" id="list-${list.id}" value="${list.id}"  class="shopping-list-original-checkbox">
                  <div class="shopping-list-checkbox-custom">
                    <svg class="shopping-list-checkbox-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                </div>
                <label for="list-${list.id}">${list.name}</label>
            </div>
            `,
        )
        .join("")
        .concat(spinnerHTML);

      this.bindListCheckboxes();
    } catch (error) {
      container.innerHTML =
        "<p>Failed to load shopping lists. Please try again.</p>".concat(
          spinnerHTML,
        );
      saveButton.style.display = "none";
    } finally {
      spinner.style.display = "none";
    }
  }

  bindListCheckboxes() {
    const checkboxes = this.modal.querySelectorAll(".shopping-list-item");
    checkboxes.forEach((checkbox) => {
      const newCheckbox = checkbox.cloneNode(true);
      checkbox.parentNode.replaceChild(newCheckbox, checkbox);

      const customCheckbox = newCheckbox.querySelector(
        ".shopping-list-checkbox-custom",
      );
      const input = newCheckbox.querySelector('input[type="checkbox"]');

      customCheckbox.addEventListener("click", (e) => {
        const check =
          e.target.classList.contains("shopping-list-checkbox-custom") ||
          e.target.classList.contains("shopping-list-checkbox-icon") ||
          e.target.parentElement.classList.contains(
            "shopping-list-checkbox-custom",
          ) ||
          e.target.parentElement.classList.contains(
            "shopping-list-checkbox-icon",
          );
        if (check) {
          e.stopPropagation();
          input.checked = !input.checked;
          if (input.checked) {
            this.selectedLists.add(input.value);
          } else {
            this.selectedLists.delete(input.value);
          }

          document.getElementById("shopping-list-save-to-lists").disabled =
            this.selectedLists.size === 0;
        }
      });

      newCheckbox.addEventListener("change", (e) => {
        if (e.target.checked) {
          this.selectedLists.add(e.target.value);
        } else {
          this.selectedLists.delete(e.target.value);
        }

        document.getElementById("shopping-list-save-to-lists").disabled =
          this.selectedLists.size === 0;
      });
    });
  }

  async saveToLists() {
    const saveButton = document.getElementById("shopping-list-save-to-lists");
    saveButton.disabled = true;
    const that = this;

    const results = await Promise.all(
      Array.from(this.selectedLists).map((listId) =>
        that.updateShoppingListItems({
          storeName: shopifyInformation.storeName,
          customerId: shopifyInformation.shopifyCustomerId,
          companyLocationId: shopifyInformation.shopifyCompanyLocationId,
          companyId: shopifyInformation.shopifyCompanyId,
          shoppingListId: Number(listId),
          data: {
            listItems: this.selectedProducts,
          },
        }),
      ),
    );

    if (results.every((result) => result?.listItems?.length > 0)) {
      createToast(
        this.modal.getAttribute("data-add-to-list-success-message"),
        "",
        "success",
      );
      this.close();
    } else {
      createToast(
        this.modal.getAttribute("data-add-to-list-error-message"),
        "",
        "error",
      );
    }
    saveButton.disabled = false;
  }

  showCreateListForm() {
    this.createListModal.style.display = "block";
    this.modal.style.display = "none";
    const defaultCheckbox = this.createListModal.querySelector(
      ".shopping-list-original-checkbox",
    );
    const customCheckbox = this.createListModal.querySelector(
      ".shopping-list-checkbox-custom",
    );

    const newCustomCheckbox = customCheckbox.cloneNode(true);
    customCheckbox.parentNode.replaceChild(newCustomCheckbox, customCheckbox);

    newCustomCheckbox.addEventListener("click", (e) => {
      const check =
        e.target.classList.contains("shopping-list-checkbox-custom") ||
        e.target.classList.contains("shopping-list-checkbox-icon") ||
        e.target.parentElement.classList.contains(
          "shopping-list-checkbox-custom",
        ) ||
        e.target.parentElement.classList.contains(
          "shopping-list-checkbox-icon",
        );

      if (check) {
        e.stopPropagation();
        defaultCheckbox.checked = !defaultCheckbox.checked;
      }
    });
  }

  validateCreateListForm() {
    const form = document.getElementById("create-list-form");
    const nameInput = form.querySelector("#shoppingListName");
    const errorMessage = nameInput.nextElementSibling;
    const submitButton = document.getElementById("create-list-submit");

    // reset error message
    errorMessage.style.display = "none";
    errorMessage.textContent = "";

    const name = nameInput.value.trim();

    // check if empty
    if (!name) {
      errorMessage.textContent = "Shopping List Name is required";
      errorMessage.style.display = "block";
      submitButton.disabled = true;
      return false;
    }

    // check length
    if (name.length < 3 || name.length > 50) {
      errorMessage.textContent =
        "Shopping list name must be between 3 and 50 characters";
      errorMessage.style.display = "block";
      submitButton.disabled = true;
      return false;
    }

    submitButton.disabled = false;
    return true;
  }

  bindCreateListFormEvents() {
    const form = document.getElementById("create-list-form");
    const submitButton = document.getElementById("create-list-submit");
    const description = document.getElementById("shoppingListDescription");
    const nameInput = document.getElementById("shoppingListName");
    const errorMessage = nameInput.nextElementSibling;

    // clone description input
    const newDescription = description.cloneNode(true);
    description.parentNode.replaceChild(newDescription, description);
    // const charCount = newDescription.nextElementSibling;

    // // bind description input event
    // newDescription.addEventListener("input", (e) => {
    //   const count = e.target.value.length;
    //   charCount.textContent = `${count}/200`;
    // });

    // clone close button
    this.createListModal
      .querySelectorAll("[data-modal='create-list-modal']")
      .forEach((btn) => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener("click", () => {
          this.createListModal.style.display = "none";
          form.reset();
        });
      });

    // clone name input
    const newNameInput = nameInput.cloneNode(true);
    nameInput.parentNode.replaceChild(newNameInput, nameInput);
    newNameInput.addEventListener("input", () => {
      this.validateCreateListForm();
    });
    newNameInput.addEventListener("blur", () => {
      this.validateCreateListForm();
    });

    // clone submit button
    const newSubmitButton = submitButton.cloneNode(true);
    submitButton.parentNode.replaceChild(newSubmitButton, submitButton);
    newSubmitButton.addEventListener("click", async () => {
      if (!this.validateCreateListForm()) {
        return;
      }

      this.setButtonLoading("create-list-submit", true);
      const formData = new FormData(form);
      const payload = {
        storeName: shopifyInformation.storeName,
        customerId: shopifyInformation.shopifyCustomerId,
        companyLocationId: shopifyInformation.shopifyCompanyLocationId,
        data: {
          shoppingListName: formData.get("shoppingListName"),
          description: formData.get("shoppingListDescription"),
          isDefault: formData.get("isDefault") === "on",
        },
      };

      this.createShoppingList(payload)
        .then((result) => {
          if (!result?.shoppingList) {
            if (result?.message?.includes("already exists")) {
              errorMessage.textContent =
                "A shopping list with this name already exists";
              errorMessage.style.display = "block";
            } else {
              createToast(
                this.modal.getAttribute("data-create-list-error-message"),
                "",
                "error",
              );
            }
            return;
          }
          errorMessage.style.display = "none";
          errorMessage.textContent = "";
          const successMessage = this.modal.getAttribute(
            "data-create-list-success-message",
          );
          createToast(
            successMessage.replace(
              "{payload.data.shoppingListName}",
              payload.data.shoppingListName,
            ),
            "",
            "success",
          );
          this.createListModal.style.display = "none";
          form.reset();
          this.loadShoppingLists();
          this.selectedLists.clear();
          this.selectedLists.add(result.shoppingList.id);
          this.handleSaveToLists();
        })
        .catch((error) => {
          createToast(
            this.modal.getAttribute("data-create-list-error-message"),
            "",
            "error",
          );
          console.error("Failed to create list:", error);
        })
        .finally(() => {
          this.setButtonLoading("create-list-submit", false);
        });
    });
  }

  setButtonLoading(buttonId, isLoading) {
    const button = document.getElementById(buttonId);
    const buttonText = button.querySelector(".shopping-list-button-text");
    const buttonLoading = button.querySelector(".shopping-list-button-loading");

    button.disabled = isLoading;
    buttonText.style.display = isLoading ? "none" : "block";
    buttonLoading.style.display = isLoading ? "flex" : "none";
  }

  async handleSaveToLists() {
    try {
      this.setButtonLoading("shopping-list-save-to-lists", true);
      // original save logic
      await this.saveToLists();
    } catch (error) {
      createToast(
        this.modal.getAttribute("data-add-to-list-error-message"),
        "",
        "error",
      );
      console.error("Failed to add to shopping list:", error);
    } finally {
      this.setButtonLoading("shopping-list-save-to-lists", false);
    }
  }

  initProductGridObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const productGrid = document.querySelector(".product-grid");
        if (productGrid && mutation.target.contains(productGrid)) {
          this.initAddToShoppingListButton();
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  initCartItemSelectorObserver() {
    const cartObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Check if the mutation is a cart-items change
        const cartItems = document.querySelector("cart-items");

        // Check if the change is within the cart-items component
        const isCartChange = mutation.target.closest("cart-items");

        if (!isCartChange) return;

        // Check if the cart is empty
        const isCartEmpty =
          cartItems && cartItems.classList.contains("is-empty");

        if (isCartEmpty) return;

        const selectorContainer = document.querySelector(
          ".cart-add-to-list-btn-template",
        );
        if (!selectorContainer) return;

        const existingButtons = selectorContainer.querySelector(
          ".cart-add-to-list-button",
        );
        if (existingButtons) return;

        this.initCartAddToListBtnTemplate();
      });
    });

    // Configure observer options
    const config = {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"], // Only observe class name changes
    };

    // Start observing the cart area
    const cartContainers = document.querySelector("cart-items");
    if (cartContainers) {
      cartObserver.observe(cartContainers, config);
    }

    // Initialize existing cart items
    this.initCartAddToListBtnTemplate();
  }

  initCartAddToListBtnTemplate() {
    const cartContainers = document.querySelector("cart-items");
    if (!cartContainers) return;

    const cartAddToListContainers = cartContainers.querySelector(
      ".cart-add-to-list-btn-template",
    );

    if (!cartAddToListContainers) return;

    // Remove existing button
    const existingButton = cartAddToListContainers.querySelector(
      ".cart-add-to-list-button",
    );
    if (existingButton) {
      existingButton.remove();
    }

    // Create new AddToListButton instance with custom configuration
    new AddToListButton(cartAddToListContainers, {
      buttonClass: "cart-add-to-list-button",
      buttonText: this.addToListButtonText,
      disabled: true,
    });
  }
}

// initialize
window.shoppingListModal = new ShoppingListModal();
