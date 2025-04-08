class ProductCompare {
  constructor() {
    const compareSettings =
      document.querySelector("[data-compare-settings]")?.dataset
        .compareSettings || "";
    this.locale =
      window.Shopify.locale === "en" ? "" : `/${window.Shopify.locale}`;
    this.allowedPaths = compareSettings
      .replace(this.locale, "")
      .replace(/^["']|["']$/g, "")
      .split(",")
      .map((path) => path.trim().replace(/^['"]|['"]$/g, ""))
      .filter(Boolean);
    this.compareCheckboxText =
      document.querySelector("[data-compare-checkbox-text]")?.dataset
        .compareCheckboxText || "Compare";

    if (!this.shouldShowCompare()) {
      return;
    }

    this.compareBar = document.getElementById("compare-tray");
    this.compareProducts = document.getElementById("compare-products");
    this.compareButton = document.getElementById("compare-button");
    this.compareCount = document.getElementById("compare-count");
    this.clearButton = document.getElementById("compare-clear");
    this.maxProducts = 4;
    this.selectedProducts = new Map();
    this.checkboxesInitialized = false;

    this.init();
    this.initMutationObserver();
  }

  init() {
    this.initCheckboxes();
    this.initClearButton();
    this.initCompareButton();
    this.initCompareCheckboxes();
    this.loadSavedProducts();
  }

  initCheckboxes() {
    document.addEventListener("change", (e) => {
      if (e.target.matches(".compare-checkbox")) {
        if (e.target.checked) {
          this.addProduct(e.target);
        } else {
          this.removeProduct(e.target.value);
        }
      }
    });
  }

  addProduct(checkbox) {
    if (this.selectedProducts.size >= this.maxProducts) {
      checkbox.checked = false;
      return;
    }

    const productData = {
      id: checkbox.value,
      title: checkbox.dataset.productTitle,
      image: checkbox.dataset.productImage,
      url: checkbox.dataset.productUrl,
    };

    this.selectedProducts.set(productData.id, productData);
    this.updateCompareBar();
    this.updateCheckboxStates();
    this.saveProducts();
  }

  removeProduct(productId) {
    this.selectedProducts.delete(productId);
    this.updateCompareBar();
    this.updateCheckboxStates();
    this.saveProducts();

    const checkbox = document.querySelector(
      `.compare-checkbox[value="${productId}"]`,
    );
    if (checkbox) checkbox.checked = false;
  }

  updateCompareBar() {
    this.compareProducts.innerHTML = "";
    const template = document.getElementById("compare-product-template");

    // Add selected products
    this.selectedProducts.forEach((product) => {
      const clone = template.content.cloneNode(true);

      const img = clone.querySelector("img");
      const imgWrapper = clone.querySelector(".compare-product-image-wrapper");

      if (product.image) {
        img.src = product.image;
        img.alt = product.title;
        imgWrapper.classList.remove("no-image");
      } else {
        img.remove(); // Remove img tag
        imgWrapper.classList.add("no-image");
      }

      const removeButton = clone.querySelector(".remove-compare");
      removeButton.addEventListener("click", () =>
        this.removeProduct(product.id),
      );

      this.compareProducts.appendChild(clone);
    });

    // Add placeholders
    const remainingSlots = this.maxProducts - this.selectedProducts.size;
    for (let i = 0; i < remainingSlots; i++) {
      const clone = template.content.cloneNode(true);
      clone
        .querySelector(".compare-product")
        .classList.add("compare-product-placeholder");

      const imgWrapper = clone.querySelector(".compare-product-image-wrapper");
      imgWrapper.innerHTML = `<span class="compare-product-number">${
        this.selectedProducts.size + i + 1
      }</span>`;

      this.compareProducts.appendChild(clone);
    }

    this.compareCount.textContent = this.selectedProducts.size;
    this.compareButton.disabled = this.selectedProducts.size < 2;

    if (this.selectedProducts.size === 0) {
      this.compareBar.classList.remove("active");
    } else {
      this.compareBar.classList.add("active");
    }
  }

  initClearButton() {
    this.clearButton.addEventListener("click", () => {
      this.selectedProducts.clear();
      this.updateCompareBar();
      this.updateCheckboxStates();
      this.saveProducts();

      document.querySelectorAll(".compare-checkbox").forEach((checkbox) => {
        checkbox.checked = false;
      });

      this.compareBar.classList.remove("active");
    });
  }

  addLocalePath(path) {
    const locale = window.Shopify.locale;
    const prefix = locale === "en" ? "" : `/${locale}`;
    return `${prefix}${path}`;
  }

  initCompareButton() {
    this.compareButton.addEventListener("click", () => {
      const currentPath = window.location.pathname + window.location.search;
      const compareUrl = this.addLocalePath(
        `/apps/customer-account/compare?returnTo=${encodeURIComponent(currentPath)}`,
      );
      window.location.href = compareUrl;
    });
  }

  saveProducts() {
    localStorage.setItem(
      "compare-product-ids",
      JSON.stringify(Array.from(this.selectedProducts.entries())),
    );
  }

  loadSavedProducts() {
    const saved = localStorage.getItem("compare-product-ids");
    if (saved) {
      this.selectedProducts = new Map(JSON.parse(saved));
      this.updateCompareBar();
      this.updateAllCheckboxStates();
    }
  }

  updateCheckboxStates() {
    const allCheckboxes = document.querySelectorAll(".compare-label");
    const isMaxReached = this.selectedProducts.size >= this.maxProducts;

    allCheckboxes.forEach((label) => {
      const checkbox = label.querySelector(".compare-checkbox");

      if (!checkbox.checked && isMaxReached) {
        label.classList.add("compare-checkbox-disabled");
        checkbox.disabled = true;
      } else {
        label.classList.remove("compare-checkbox-disabled");
        checkbox.disabled = false;
      }
    });
  }

  initMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Check if the mutation affects product grid
        const productGrid = document.querySelector(".product-grid");
        if (productGrid && mutation.target.contains(productGrid)) {
          // Reinitialize compare checkboxes
          this.initCompareCheckboxes();
        }
      });
    });

    // Observe changes in the entire document body
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  updateAllCheckboxStates() {
    document.querySelectorAll(".compare-checkbox").forEach((checkbox) => {
      const productId = checkbox.value;
      if (this.selectedProducts.has(productId)) {
        checkbox.checked = true;
      }
    });
    this.updateCheckboxStates();
  }

  shouldShowCompare() {
    const currentPath = window.location.pathname.replace(this.locale, "");
    const currentFirstSegment = "/" + currentPath.split("/")[1];

    return this.allowedPaths.some((path) => {
      return currentFirstSegment === path;
    });
  }

  initCompareCheckboxes() {
    if (!this.shouldShowCompare()) {
      return;
    }

    const quickAddButtons = document.querySelectorAll(".quick-add");

    // Remove existing compare wrappers to avoid duplicates
    document.querySelectorAll(".compare-wrapper").forEach((wrapper) => {
      wrapper.remove();
    });

    if (!quickAddButtons.length) {
      setTimeout(() => this.initCompareCheckboxes(), 100);
      return;
    }

    quickAddButtons.forEach((button) => {
      const card = button.closest(".card__information");
      if (!card) return;

      // Get product data from the card
      const productCard = card.closest(".card");
      if (!productCard) return;

      const productLink = productCard.querySelector(".card__heading a");
      const productImage = productCard.querySelector(".card__media img");

      if (!productLink) return;

      // Change: Get productId from link's id attribute
      const productId = productLink.id.split("-").pop();
      const productTitle = productLink.textContent.trim();
      const productImageUrl = productImage?.src
        ? productImage.src.replace(/(\?.*)?$/, "") + "?width=100"
        : "";
      const productUrl = productLink.href;

      // Create compare wrapper
      const compareWrapper = document.createElement("div");
      compareWrapper.className = "compare-wrapper";
      compareWrapper.innerHTML = `
        <label class="compare-label">
          <input type="checkbox" 
                 name="compare" 
                 class="compare-checkbox"
                 style="display: none;"
                 value="${productId}" 
                 data-product-title="${productTitle}"
                 data-product-image="${productImageUrl}"
                 data-product-url="${productUrl}">
          <div class="compare-checkbox-custom">
            <svg class="compare-checkbox-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </div>
          <span class="compare-text">${this.compareCheckboxText}</span>
        </label>
      `;

      // Insert before quick-add button
      button.parentNode.insertBefore(compareWrapper, button);
    });

    this.checkboxesInitialized = true;
    this.updateAllCheckboxStates();
  }
}

new ProductCompare();
