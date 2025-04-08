class AddToListButton {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      buttonClass: "add-to-list-button",
      buttonText: "Add to List",
      ...options,
    };

    this.selectedProducts = [];
    this.ids = {
      originalProductId: "",
      originalProductVariantId: "",
    };

    this.init();
  }

  init() {
    this.renderButton();
    this.bindEvents();
  }

  renderButton() {
    const btnDom = document.createElement("div");
    btnDom.style.width = "100%";
    btnDom.innerHTML = `
      <button type="button" class="${this.options.buttonClass}" ${this.options.disabled ? "disabled" : ""}>${this.options.buttonText}</button>
    `;
    this.container.appendChild(btnDom);
  }

  bindEvents() {
    const button = this.container.querySelector(`.${this.options.buttonClass}`);
    button.addEventListener("click", () => this.handleClick());
  }

  formatUrl(url) {
    return url.split("?")[0];
  }

  async handleClick() {
    let url = "";
    const productForm = this.findProductForm();

    if (this.container.classList.contains("cart-add-to-list-btn-template")) {
      const selectedProducts = document.querySelectorAll(
        ".cart-item-checkbox-wrapper",
      );

      const checkedProducts = Array.from(selectedProducts)
        .map((checkbox) => {
          const dataCheckbox = checkbox.querySelector(
            ".cart-selector-checkbox",
          );
          if (dataCheckbox.getAttribute("aria-checked") === "true") {
            return dataCheckbox;
          }
        })
        .filter(Boolean);

      const temp = checkedProducts.map((item) => {
        const productLink = item.getAttribute("data-product-url").split("?")[0];
        const variantId = item.getAttribute("data-variant-id");
        const quantity = item.getAttribute("data-quantity");

        const isNumber = !isNaN(Number(quantity));
        return {
          productVariantId: setProductVariantId(variantId),
          url: this.formatUrl(productLink),
          quantity: isNumber ? Number(quantity) : 1,
        };
      });

      this.selectedProducts = temp;

      window.shoppingListModal.selectedProducts = this.selectedProducts;
      window.shoppingListModal.open();
      return;
    }

    if (!productForm) return;

    url = this.formatUrl(this.getProductUrl(productForm));

    const { productId, variantId, quantity } =
      this.getProductDetails(productForm);

    const temp = {
      productId: setProductId(productId),
      productVariantId: setProductVariantId(variantId),
      url,
      quantity,
    };

    this.ids.originalProductId = productId;
    this.ids.originalProductVariantId = variantId;
    this.selectedProducts = [temp];

    window.shoppingListModal.selectedProducts = this.selectedProducts;
    window.shoppingListModal.ids = this.ids;
    window.shoppingListModal.open();
  }

  findProductForm() {
    const isInCart = this.container.closest("cart-items");

    if (isInCart) {
      return this.container.closest(".cart-item");
    }

    return (
      this.container.closest('form[data-type="add-to-cart-form"]') ||
      this.container.querySelector('form[data-type="add-to-cart-form"]')
    );
  }

  getProductUrl(productForm) {
    const isInCart = this.container.closest("cart-items");

    if (isInCart) {
      const cartItem = this.container.closest(".cart-item");
      if (!cartItem) return "";

      const productLink = cartItem.querySelector(".cart-item__name");
      return productLink ? productLink.href : "";
    }

    const urlInput = productForm.querySelector('input[name="url"]');
    if (urlInput) return urlInput.value;

    const card = this.container.closest(".card__information");
    if (card) {
      const productLink = card
        .closest(".card")
        ?.querySelector(".card__heading a");
      if (productLink) return productLink.href;
    }

    const productFormId = productForm.getAttribute("id");

    const sectionDom = document.querySelector(
      `#ProductInfo${productFormId.replace("product-form", "")}`,
    );

    if (sectionDom) {
      const productTitle = sectionDom.querySelectorAll(".product__title")?.[1];

      if (productTitle) return productTitle.href;
    }

    // in diy fetured products section

    const productTitle =
      productForm.parentElement?.parentElement?.querySelectorAll(
        ".product__title",
      )?.[1];

    if (productTitle) return productTitle.href;

    // in diy fetured products section
    const parentDom = productForm.parentElement?.parentElement?.parentElement;
    const aDom = parentDom?.querySelector("a");
    if (aDom) {
      return aDom.href;
    }

    return "";
  }

  getProductDetails(form) {
    const isInCart = this.container.closest("cart-items, cart-drawer");

    if (isInCart) {
      const cartItem = this.container.closest(".cart-item");
      if (!cartItem) return {};

      const variantId = cartItem.querySelector("[data-quantity-variant-id]")
        ?.dataset.quantityVariantId;
      const productId = cartItem.querySelector("[data-product-id]")?.value;
      const quantityInput = cartItem.querySelector('[name="updates[]"]');
      const quantity = quantityInput ? quantityInput.value : 1;
      const isNumber = !isNaN(Number(quantity));

      return {
        productId,
        variantId,
        quantity: isNumber ? Number(quantity) : 1,
      };
    }

    const card = form.closest(".card");
    // const product = form.closest(".product");
    // let imgLink = null;
    // if (card) {
    //   console.log("🚀 ~ AddToListButton ~ getProductDetails ~ card:", card);
    //   const img = card.querySelector("img");
    //   if (img) {
    //     imgLink = img.src;
    //   }
    // }

    const sectionId = form.querySelector('input[name="section-id"]')?.value;
    const variantId = form.querySelector('input[name="id"]')?.value;

    const productId = form.querySelector('input[name="product-id"]')?.value;
    const quantityInput = document.querySelector(
      `[data-section="${sectionId}"] input[name="quantity"]`,
    );
    const quantity = quantityInput ? quantityInput.value : 1;
    const isNumber = !isNaN(Number(quantity));

    return {
      productId,
      variantId,
      quantity: isNumber ? Number(quantity) : 1,
      // imgLink,
    };
  }
}
