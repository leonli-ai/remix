class CustomerPartnerNumberBlock {
  constructor() {
    this.appUrl = document
      .querySelector(".customer-partner-number-block")
      .getAttribute("data-app-url");
    this.store = document
      .querySelector(".customer-partner-number-block")
      .getAttribute("data-store");
    this.loadSettings();
    this.isUpdating = false;
    this.init();
    this.setupAjaxListener();
    this.observeFilterChanges();
    this.observePDPVariantChanges();

    // Handle cart page
    if (window.location.pathname.includes("/cart")) {
      this.updateCartCustomerPartnerNumbers();
      this.observeCartChanges();
    }
  }

  loadSettings() {
    const settings = window.Shopify?.theme?.settings || {};
    try {
      this.selectorGroups =
        typeof settings.selector_groups === "string"
          ? JSON.parse(settings.selector_groups)
          : settings || {
              "home-featured-products-section": {
                container: ".featured-products-slider .product-card-box",
                sku_link:
                  ".featured-products-slider .product-card-box .product-card-information a",
                insert_position:
                  ".featured-products-slider .product-card-information",
              },
              "home-featured-plumbing-products-section": {
                container: ".featured-plumbing-products-wrapper",
                sku_link: ".product-card-information a",
                insert_position:
                  ".featured-plumbing-products-wrapper .product-card-information",
              },
              plp: {
                container: ".product-card-wrapper",
                sku_link: ".card__content .card__information .card__heading a",
                insert_position:
                  ".card__content .card__information .card-information",
              },
            };
    } catch (error) {
      console.error("Error parsing selector groups:", error);
      this.selectorGroups = {
        plp: {
          container: ".product-card-wrapper",
          sku_link: ".card__content .card__information .card__heading a",
          insert_position:
            ".card__content .card__information .card-information",
        },
      };
    }
  }

  extractSkuFromHref(href) {
    if (!href) return null;

    const urlWithoutQuery = href.split("?")[0];

    const lastSegment = urlWithoutQuery.split("/").pop();
    if (!lastSegment) return null;

    const sku = lastSegment.split("-").pop();
    return sku || null;
  }

  observeCartChanges() {
    if (!window.location.pathname.includes("/cart")) return;

    const cartContainer = document.querySelector("cart-items");
    if (!cartContainer) return;

    const observer = new MutationObserver((mutations) => {
      const hasCartChanges = mutations.some((mutation) =>
        [...mutation.addedNodes, ...mutation.removedNodes].some(
          (node) =>
            node.nodeType === 1 &&
            (node.classList?.contains("cart-item") ||
              node.querySelector?.(".cart-item")),
        ),
      );

      if (hasCartChanges) {
        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => {
          this.updateCartCustomerPartnerNumbers();
        }, 300);
      }
    });

    observer.observe(cartContainer, {
      childList: true,
      subtree: true,
    });
  }

  setupAjaxListener() {
    if (window.location.pathname.includes("/cart")) {
      // Monitor all AJAX requests
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const response = await originalFetch(...args);

        // Clone response so we can check the URL
        const responseClone = response.clone();

        // Check if this is a cart-related request
        if (args[0] && args[0].toString().includes("/cart")) {
          // Wait for request to complete before reinitializing
          responseClone.json().then(() => {
            setTimeout(() => {
              this.init();
            }, 300); // Allow enough time for cart DOM to update
          });
        }

        return response;
      };

      // Keep MutationObserver as a fallback
      const cartContainer = document.querySelector("#main-cart-items");
      if (cartContainer) {
        const observer = new MutationObserver((mutations) => {
          const hasCartItemChanges = mutations.some((mutation) => {
            return (
              [...mutation.removedNodes].some((node) =>
                node.classList?.contains("cart-item"),
              ) ||
              [...mutation.addedNodes].some((node) =>
                node.classList?.contains("cart-item"),
              )
            );
          });

          if (hasCartItemChanges) {
            clearTimeout(this.updateTimeout);
            this.updateTimeout = setTimeout(() => {
              this.isUpdating = true;
              this.init();
              this.isUpdating = false;
            }, 300);
          }
        });

        observer.observe(cartContainer, {
          childList: true,
          subtree: true,
          attributes: false,
        });
      }
    }
  }

  init() {
    if (this.isUpdating) return;
    this.isUpdating = true;

    try {
      // Ensure there is at least one item in cart page
      if (window.location.pathname.includes("/cart")) {
        const cartItems = document.querySelectorAll(".cart-item");
        if (cartItems.length === 0) return;
      }

      // Remove existing customer partner number elements before processing
      document
        .querySelectorAll(".customer-partner-number-wrapper")
        .forEach((el) => el.remove());

      // Convert Map to object with array values
      const skuMap = {};

      Object.entries(this.selectorGroups).forEach(([groupName, selectors]) => {
        const containers = document.querySelectorAll(selectors.container);

        containers.forEach((container) => {
          // Skip if container already has a customer partner number wrapper
          if (container.querySelector(".customer-partner-number-wrapper")) {
            return;
          }

          const productLink = container.querySelector(selectors.sku_link);
          if (!productLink) return;

          const href = productLink.getAttribute("href");
          const sku = this.extractSkuFromHref(href);
          if (sku) {
            if (!skuMap[sku]) {
              skuMap[sku] = [];
            }
            // Check if this container is already in the map
            const existingEntry = skuMap[sku].find(
              (entry) => entry.container === container,
            );
            if (!existingEntry) {
              skuMap[sku].push({
                container,
                insertSelector: selectors.insert_position,
              });
            }
          }
        });
      });

      if (Object.keys(skuMap).length > 0) {
        this.fetchCustomerPartnerNumbers(Object.entries(skuMap));
      }
    } finally {
      this.isUpdating = false;
    }
  }

  async fetchCustomerPartnerNumbers(skuEntries) {
    const cache = this.customerPartnerNumberCache || new Map();
    const skusToFetch = skuEntries
      .map(([sku]) => sku)
      .filter((sku) => !cache.has(sku));

    if (skusToFetch.length === 0) {
      // Use cached data
      this.renderCustomerPartnerNumbers(skuEntries, Array.from(cache.values()));
      return;
    }

    try {
      const storeName = localStorage.getItem("store-name");
      const companyId = localStorage.getItem("company-id");

      if (!storeName || !companyId) {
        console.warn("Store name or company ID not found in session storage");
        return;
      }

      const response = await this.fetchWithRetry(
        `${this.appUrl}/api/v1/product-variant/customer-partner-number/get-by-sku`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            storeName,
            companyId: `gid://shopify/Company/${companyId}`,
            skuIds: skusToFetch,
          }),
        },
      );

      const data = await response.json();

      if (data?.customerPartnerNumberDetails) {
        // Update cache
        data.customerPartnerNumberDetails.forEach((item) => {
          cache.set(item.skuId, item);
        });
        this.customerPartnerNumberCache = cache;

        this.renderCustomerPartnerNumbers(
          skuEntries,
          data.customerPartnerNumberDetails,
        );
      }
    } catch (error) {
      console.error("Error fetching customer partner numbers:", error);
    }
  }

  async fetchWithRetry(url, options, retries = 3, delay = 1000) {
    try {
      return await fetch(url, options);
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  renderCustomerPartnerNumbers(skuEntries, customerPartnerNumbers) {
    customerPartnerNumbers.forEach((item) => {
      const positions = skuEntries.find(([sku]) => sku === item.skuId)?.[1];
      if (!positions) return;

      positions.forEach((position) => {
        if (
          position.container.querySelector(".customer-partner-number-wrapper")
        ) {
          return;
        }

        const insertPosition = position.container.querySelector(
          position.insertSelector,
        );

        if (insertPosition) {
          const template = this.createCustomerPartnerNumberTemplate(
            item.customerPartnerNumber,
          );
          insertPosition.insertAdjacentHTML("afterend", template);
        }
      });
    });
  }

  createCustomerPartnerNumberTemplate(number) {
    const customerPartnerNumberText = document
      .querySelector(".customer-partner-number-block")
      ?.getAttribute("data-customer-partner-number-text");
    return `
      <div class="customer-partner-number-wrapper">
        <p class="customer-partner-number-label swiper-no-swiping">
          ${customerPartnerNumberText || "Customer Partner Number"}:
        </p>
        <style>
        .customer-partner-number-value {
          resize: none;
          background: transparent;
        }
        </style>
        <textarea disabled class="twcss-h-5 twcss-bg-transparent customer-partner-number-value swiper-no-swiping">${number || ""}</textarea>
      </div>
    `;
  }

  observeFilterChanges() {
    // Helper function for debouncing with minimum delay
    const debounce = (fn, delay) => {
      let timeoutId;
      let lastCallTime = 0;

      return (...args) => {
        clearTimeout(timeoutId);
        const now = Date.now();

        // Ensure minimum time between actual function calls
        const timeToWait = Math.max(delay - (now - lastCallTime), 0);

        timeoutId = setTimeout(() => {
          lastCallTime = Date.now();
          fn.apply(this, args);
        }, timeToWait);
      };
    };

    // Create a single debounced retry function with longer delay
    const debouncedRetryInit = debounce(() => {
      const products = document.querySelectorAll(
        this.selectorGroups.plp.container,
      );
      if (products.length > 0) {
        // Reset any ongoing retries
        if (this.currentRetryTimeout) {
          clearTimeout(this.currentRetryTimeout);
        }
        // Clear any existing customer partner numbers before retrying
        document
          .querySelectorAll(".customer-partner-number-wrapper")
          .forEach((el) => el.remove());
        this.retryInit(10); // Increased max attempts
      }
    }, 1000); // Increased delay

    // Monitor sort by changes with special handling
    const sortBySelect = document.querySelector("#SortBy");
    if (sortBySelect) {
      sortBySelect.addEventListener("change", () => {
        // Clear existing numbers immediately
        document
          .querySelectorAll(".customer-partner-number-wrapper")
          .forEach((el) => el.remove());

        // Monitor AJAX requests to catch Shopify's sort request
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
          const response = await originalFetch(...args);
          const responseClone = response.clone();

          // Check if this is a collection/sorting request
          if (
            args[0] &&
            typeof args[0] === "string" &&
            (args[0].includes("/collections/") || args[0].includes("sort_by="))
          ) {
            // Wait for the response and DOM update
            responseClone.text().then(() => {
              // Start multiple retry attempts
              let retryCount = 0;
              const maxRetries = 5;

              const retryInitialization = () => {
                const products = document.querySelectorAll(
                  this.selectorGroups.plp.container,
                );
                if (products.length > 0) {
                  setTimeout(() => {
                    this.init();
                    // Double check after a delay
                    setTimeout(() => {
                      this.ensureAllProductsHaveNumbers();
                    }, 500);
                  }, 300);
                } else if (retryCount < maxRetries) {
                  retryCount++;
                  setTimeout(retryInitialization, 300 * retryCount);
                }
              };

              // Start the retry process
              retryInitialization();
            });
          }

          return response;
        };

        // Restore original fetch after 5 seconds
        setTimeout(() => {
          window.fetch = originalFetch;
        }, 5000);
      });
    }

    // Also monitor the product grid for AJAX-based updates
    const productGrid = document.querySelector(".product-grid-container");
    if (productGrid) {
      const gridObserver = new MutationObserver((mutations) => {
        const hasProductChanges = mutations.some((mutation) =>
          Array.from(mutation.addedNodes).some(
            (node) =>
              node.nodeType === 1 &&
              (node.classList?.contains("product-card-wrapper") ||
                node.querySelector?.(".product-card-wrapper")),
          ),
        );

        if (hasProductChanges) {
          // Wait for all products to be fully rendered
          setTimeout(() => {
            this.init();
            // Double check after a delay
            setTimeout(() => {
              this.ensureAllProductsHaveNumbers();
            }, 500);
          }, 300);
        }
      });

      gridObserver.observe(productGrid, {
        childList: true,
        subtree: true,
      });
    }

    // Monitor URL changes for page navigation and sorting
    let currentUrl = location.href;
    new MutationObserver(() => {
      const newUrl = location.href;
      if (newUrl !== currentUrl) {
        currentUrl = newUrl;
        debouncedRetryInit();
      }
    }).observe(document, { subtree: true, childList: true });

    // Monitor facet changes through URL and form changes
    const facetsForm = document.querySelector("#FacetFiltersForm");
    if (facetsForm) {
      // Monitor checkbox changes
      const checkboxObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "checked" &&
            mutation.target.matches('input[type="checkbox"][name^="filter."]')
          ) {
            debouncedRetryInit();
          }
        });
      });

      facetsForm
        .querySelectorAll('input[type="checkbox"][name^="filter."]')
        .forEach((checkbox) => {
          checkboxObserver.observe(checkbox, {
            attributes: true,
            attributeFilter: ["checked"],
          });
        });

      // Monitor price range inputs
      const priceInputs = facetsForm.querySelectorAll(
        'input[name^="filter.v.price"]',
      );
      priceInputs.forEach((input) => {
        input.addEventListener("change", debouncedRetryInit);
      });
    }
  }

  // New method to wait for products and initialize
  waitForProductsAndInit(checkInterval = 500, maxAttempts = 10) {
    let attempts = 0;

    const checkProducts = () => {
      const products = document.querySelectorAll(
        this.selectorGroups.plp.container,
      );

      if (products.length > 0 && this.areProductCardsFullyLoaded(products)) {
        // Products are ready, initialize
        document
          .querySelectorAll(".customer-partner-number-wrapper")
          .forEach((el) => el.remove());
        this.init();
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(checkProducts, checkInterval);
      }
    };

    checkProducts();
  }

  retryInit(maxAttempts, currentAttempt = 1, baseDelay = 500) {
    if (this.currentRetryTimeout) {
      clearTimeout(this.currentRetryTimeout);
    }

    if (currentAttempt > maxAttempts) {
      console.warn(
        "Max retry attempts reached, will try one final time in 2 seconds",
      );
      // One final attempt after a longer delay
      this.currentRetryTimeout = setTimeout(() => {
        this.init();
      }, 2000);
      return;
    }

    const productCards = document.querySelectorAll(
      this.selectorGroups.plp.container,
    );

    if (productCards.length === 0) {
      this.currentRetryTimeout = setTimeout(() => {
        this.retryInit(maxAttempts, currentAttempt + 1, baseDelay);
      }, baseDelay);
      return;
    }

    if (this.areProductCardsFullyLoaded(productCards)) {
      this.init();
    } else {
      this.currentRetryTimeout = setTimeout(() => {
        this.retryInit(maxAttempts, currentAttempt + 1, baseDelay);
      }, baseDelay);
    }
  }

  areProductCardsFullyLoaded(productCards) {
    if (!productCards || productCards.length === 0) return false;

    let loadedCount = 0;
    const totalCards = productCards.length;

    productCards.forEach((card) => {
      // Enhanced checks for card readiness
      const hasLink = card.querySelector(this.selectorGroups.plp.sku_link);
      const hasInsertPosition = card.querySelector(
        this.selectorGroups.plp.insert_position,
      );
      const hasValidHref = hasLink && hasLink.getAttribute("href");

      // More thorough visibility and content checks
      const isVisible =
        card.offsetParent !== null &&
        card.offsetHeight > 0 &&
        card.offsetWidth > 0 &&
        card.getBoundingClientRect().width > 0;

      const hasContent = card.textContent.trim().length > 0;

      // Comprehensive image loading check
      const images = card.querySelectorAll("img");
      const areImagesLoaded =
        images.length === 0 ||
        Array.from(images).every((img) => {
          return (
            img.complete &&
            img.naturalWidth > 0 &&
            !img.classList.contains("loading")
          );
        });

      // Check for any loading states
      const hasNoLoadingStates = !card.querySelector(
        ".loading, .loading-animation",
      );

      if (
        hasLink &&
        hasInsertPosition &&
        hasValidHref &&
        isVisible &&
        hasContent &&
        areImagesLoaded &&
        hasNoLoadingStates
      ) {
        loadedCount++;
      }
    });

    // More lenient threshold but with additional safety checks
    return (loadedCount / totalCards) * 100 >= 85 && loadedCount >= 1;
  }

  observePDPVariantChanges() {
    const handleVariantChanges = (container) => {
      if (!container) return;

      const productForm = container.querySelector("product-form form");
      if (!productForm) return;

      // Get and display customer partner number on initial load
      this.updatePDPCustomerPartnerNumber(productForm);

      // Monitor variant ID changes
      const variantIdObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "value" &&
            mutation.target.matches('input[name="id"]')
          ) {
            this.updatePDPCustomerPartnerNumber(productForm);
          }
        });
      });

      const variantIdInput = productForm.querySelector('input[name="id"]');
      if (variantIdInput) {
        variantIdObserver.observe(variantIdInput, {
          attributes: true,
          attributeFilter: ["value"],
        });
      }

      // Monitor variant selector changes (as backup mechanism)
      const variantSelectors = productForm.querySelectorAll(
        'input[type="radio"], select, input[type="checkbox"]',
      );
      variantSelectors.forEach((selector) => {
        selector.addEventListener("change", () => {
          setTimeout(() => {
            this.updatePDPCustomerPartnerNumber(productForm);
          }, 100);
        });
      });

      // Cleanup function
      const cleanup = () => {
        variantIdObserver.disconnect();
      };

      // Save cleanup function to form element for later use
      productForm.cleanup = cleanup;
    };

    // Monitor main PDP page variant changes
    handleVariantChanges(document);

    // Monitor quick-add modal
    const handleQuickAddModal = (modalNode) => {
      if (!modalNode || !modalNode.matches("quick-add-modal")) return;

      // Prevent duplicate processing of the same modal
      if (modalNode.hasAttribute("data-customer-number-initialized")) return;
      modalNode.setAttribute("data-customer-number-initialized", "true");

      // Check and handle modal open state
      const handleModalOpen = () => {
        if (modalNode.hasAttribute("open")) {
          const checkForm = () => {
            const modalForm = modalNode.querySelector("product-form form");
            if (modalForm) {
              // Prevent duplicate event listeners
              if (!modalForm.hasAttribute("data-variant-listeners-added")) {
                // Set up variant monitoring
                handleVariantChanges(modalNode);
                modalForm.setAttribute("data-variant-listeners-added", "true");
              }
            } else {
              // If form hasn't loaded yet, keep waiting
              setTimeout(checkForm, 100);
            }
          };

          checkForm();
        }
      };

      // Use MutationObserver to monitor open attribute changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "open"
          ) {
            handleModalOpen();
          }
        });
      });

      observer.observe(modalNode, {
        attributes: true,
        attributeFilter: ["open"],
      });

      // Remove initialization flag when modal closes to allow re-initialization
      modalNode.addEventListener("close", () => {
        modalNode.removeAttribute("data-customer-number-initialized");
        const modalForm = modalNode.querySelector("product-form form");
        if (modalForm) {
          modalForm.removeAttribute("data-variant-listeners-added");
          // Clean up variant listeners
          if (modalForm.cleanup) {
            modalForm.cleanup();
          }
        }
      });
    };

    // Monitor quick-add modal creation
    const bodyObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.matches("quick-add-modal")) {
            handleQuickAddModal(node);
          }
        });
      });
    });

    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Handle quick-add modals that exist on page load
    document.querySelectorAll("quick-add-modal").forEach((modal) => {
      handleQuickAddModal(modal);
    });
  }

  async updatePDPCustomerPartnerNumber(productForm) {
    if (!productForm) return;

    // Get current selected variant ID
    const variantIdInput = productForm.querySelector('input[name="id"]');
    if (!variantIdInput) return;

    const variantId = Number(variantIdInput.value);
    if (!variantId) return;

    // Get product handle from product link
    const productLink = productForm
      .closest(".product__info-wrapper")
      ?.querySelector('.product__title a, [itemprop="name"] a');
    if (!productLink) return;

    const productHandle = productLink.getAttribute("href")?.split("?")[0];
    if (!productHandle) return;

    let currentVariant;
    try {
      const { productData } = await this.getProductData(productHandle);
      if (productData?.variants) {
        currentVariant = productData.variants.find((v) => v.id === variantId);
      }
    } catch (error) {
      console.error("Error fetching product data:", error);
      return;
    }

    if (!currentVariant?.sku) return;

    // Check if in quick view modal
    const quickAddModal = productForm.closest("quick-add-modal");

    // Remove all related customer partner numbers
    if (quickAddModal) {
      // In quick view modal, remove only that modal
      quickAddModal
        .querySelectorAll(".customer-partner-number-wrapper")
        .forEach((el) => el.remove());
    } else {
      // In main PDP page, remove main page
      document
        .querySelectorAll(
          ".product__info-wrapper .customer-partner-number-wrapper",
        )
        .forEach((el) => el.remove());
    }

    try {
      const storeName = localStorage.getItem("store-name");
      const companyId = localStorage.getItem("company-id");

      if (!storeName || !companyId) {
        console.warn("Store name or company ID not found in session storage");
        return;
      }

      const response = await fetch(
        `${this.appUrl}/api/v1/product-variant/customer-partner-number/get-by-sku`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            storeName: storeName,
            companyId: `gid://shopify/Company/${companyId}`,
            skuIds: [currentVariant.sku],
          }),
        },
      );

      const data = await response.json();

      if (data?.customerPartnerNumberDetails?.length > 0) {
        const item = data.customerPartnerNumberDetails[0];

        const insertPosition = document.querySelector(
          '.product__info-wrapper div[role="status"]',
        );

        if (insertPosition) {
          const template = `
            <div class="customer-partner-number-wrapper">
              <p class="customer-partner-number-label swiper-no-swiping">
                Customer Partner Number:
              </p>
              <style>
              .customer-partner-number-value {
                resize: none;
                background: transparent;
              }
              </style>
              <textarea disabled class="twcss-h-5 twcss-bg-transparent customer-partner-number-value swiper-no-swiping">${item?.customerPartnerNumber || ""}</textarea>
            </div>
          `;
          insertPosition.insertAdjacentHTML("afterend", template);
        }
      }
    } catch (error) {
      console.error("Error updating PDP customer partner number:", error);
    }
  }

  async updateCartCustomerPartnerNumbers() {
    // Get all cart items with variant IDs
    const cartItems = document.querySelectorAll(
      "cart-items .cart-item quantity-popover [data-quantity-variant-id]",
    );
    if (!cartItems.length) return;

    // Remove existing customer partner numbers in cart
    document
      .querySelectorAll(".cart-item .customer-partner-number-wrapper")
      .forEach((el) => el.remove());

    try {
      const storeName = localStorage.getItem("store-name");
      const companyId = localStorage.getItem("company-id");

      if (!storeName || !companyId) {
        console.warn("Store name or company ID not found in session storage");
        return;
      }

      // Get SKUs for all variants
      const skuMap = new Map();
      for (const item of cartItems) {
        const variantId = item.getAttribute("data-quantity-variant-id");
        if (!variantId) continue;

        // Get product handle from cart item URL
        const productLink = item
          .closest(".cart-item")
          .querySelector(".cart-item__name");
        if (!productLink) continue;

        const productHandle = productLink.getAttribute("href").split("?")[0];

        try {
          const { productData } = await this.getProductData(productHandle);
          if (!productData) continue;

          const variant = productData.variants.find(
            (v) => v.id === Number(variantId),
          );
          if (variant?.sku) {
            skuMap.set(variantId, variant.sku);
          }
        } catch (error) {
          console.error(`Error fetching data for variant ${variantId}:`, error);
        }
      }

      if (skuMap.size === 0) return;

      // Fetch customer partner numbers using SKUs
      const response = await fetch(
        `${this.appUrl}/api/v1/product-variant/customer-partner-number/get-by-sku`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            storeName,
            companyId: `gid://shopify/Company/${companyId}`,
            skuIds: Array.from(skuMap.values()),
          }),
        },
      );

      const data = await response.json();

      if (data?.customerPartnerNumberDetails?.length) {
        // Create a map of SKU to customer partner number
        const partnerNumberMap = new Map(
          data.customerPartnerNumberDetails.map((detail) => [
            detail.skuId,
            detail.customerPartnerNumber,
          ]),
        );

        // Insert customer partner numbers into cart items
        cartItems.forEach((item) => {
          const variantId = item.getAttribute("data-quantity-variant-id");
          const sku = skuMap.get(variantId);
          const partnerNumber = sku ? partnerNumberMap.get(sku) : null;

          if (partnerNumber) {
            const cartItemElement = item.closest(".cart-item");
            const insertPosition =
              cartItemElement.querySelector(".product-option");
            if (insertPosition) {
              const template =
                this.createCustomerPartnerNumberTemplate(partnerNumber);
              insertPosition.insertAdjacentHTML("afterend", template);
            }
          }
        });
      }
    } catch (error) {
      console.error("Error updating cart customer partner numbers:", error);
    }
  }

  // Add helper method to get product data
  async getProductData(handle) {
    try {
      const productResponse = await fetch(`${handle}.js`);
      const productData = await productResponse.json();
      return { productData };
    } catch (error) {
      console.error("Error fetching product data:", error);
      return null;
    }
  }

  // Add new helper method to ensure all products have numbers
  ensureAllProductsHaveNumbers() {
    const products = document.querySelectorAll(
      this.selectorGroups.plp.container,
    );
    const missingNumbers = Array.from(products).filter((product) => {
      return !product.querySelector(".customer-partner-number-wrapper");
    });

    if (missingNumbers.length > 0) {
      console.log(
        `Found ${missingNumbers.length} products missing customer numbers, reinitializing...`,
      );
      // Add a small delay before reinitializing
      setTimeout(() => {
        this.init();
        // One final check after a longer delay
        setTimeout(() => {
          const stillMissing = Array.from(
            document.querySelectorAll(this.selectorGroups.plp.container),
          ).filter(
            (product) =>
              !product.querySelector(".customer-partner-number-wrapper"),
          );
          if (stillMissing.length > 0) {
            this.init();
          }
        }, 1000);
      }, 300);
    }
  }
}

new CustomerPartnerNumberBlock();
