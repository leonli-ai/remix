// Initialize the module namespace
window.CoveoRenderersModule = window.CoveoRenderersModule || {};

// Access FacetUtils from the utils module
const { FacetUtils } = window.CoveoUtilsModule || {};

// Define your renderers as properties of the namespace instead of using const
window.CoveoRenderersModule.ResultRenderer = class ResultRenderer {
  constructor(template, locale) {
    this.template = template;
    this.locale = locale;
  }

  renderResult(result) {
    const clone = this.template.content.cloneNode(true);
    const productData = result.childResults?.[0]?.raw || result.raw;

    this.renderLinks(clone, productData);
    this.renderImage(clone, productData);
    this.renderBrand(clone, productData);
    this.renderTitle(clone, result);
    this.renderPricing(clone, productData);
    this.renderDetails(clone, productData);
    this.renderCompare(clone, productData);
    this.setupActions(clone, productData, result);

    return clone;
  }

  renderLinks(element, data) {
    const links = element.querySelectorAll('.coveo-result-link');
    const productUrl = data.ec_url || '';
    links.forEach(link => {
      link.href = productUrl;
    });
  }

  renderImage(element, data) {
    const img = element.querySelector('.coveo-result-image img');
    if (img) {
      img.src = data.ec_images || '';
      img.alt = data.ec_name || 'Product image';
    }
  }

  renderBrand(element, data) {
    const brandElement = element.querySelector('.coveo-result-brand');
    if (brandElement) {
      brandElement.textContent = data.ec_brand || '';
    }
  }

  renderTitle(element, result) {
    const titleElement = element.querySelector('.coveo-result-title a');
    if (titleElement) {
      titleElement.textContent = result.title || '';
    }
  }

  renderPricing(element, data) {
    const formatter = new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency: 'USD',
    });

    const listPriceElement = element.querySelector('.coveo-list-price-value');
    if (listPriceElement) {
      const listPrice = data.ec_price || 0;
      listPriceElement.textContent = listPrice ? formatter.format(listPrice) : '';
    }

    const yourPriceElement = element.querySelector('.coveo-your-price-value');
    if (yourPriceElement) {
      const price = data.ec_price_dict || 0;
      yourPriceElement.textContent = price ? formatter.format(price) : '';
    }
  }

  renderDetails(element, data) {
    const partNumberElement = element.querySelector('.coveo-partner-number-value');
    if (partNumberElement) {
      partNumberElement.textContent = data.ec_customer_part_number_dict || '';
    }

    const skuElement = element.querySelector('.coveo-sku-value');
    if (skuElement) {
      skuElement.textContent = data.ec_sku || '';
    }
  }

  renderCompare(element, data) {
    const compareCheckbox = element.querySelector('.compare-checkbox');
    if (compareCheckbox) {
      const uniqueId = data.permanentid || data.ec_sku || '';
      compareCheckbox.value = uniqueId;
      compareCheckbox.dataset.productTitle = data.ec_name || '';
      compareCheckbox.dataset.productImage = data.ec_images || '';
      compareCheckbox.dataset.productUrl = data.ec_url || '';
    }
  }

  setupActions(element, data, result) {
    const addToCartButton = element.querySelector('.coveo-add-to-cart');
    if (addToCartButton) {
      addToCartButton.textContent = 'Add to Cart';
      addToCartButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleAddToCart(data, addToCartButton);
      });
    }

    const addToListButton = element.querySelector('.coveo-add-to-list');
    if (addToListButton) {
      addToListButton.textContent = 'Add to List';
      addToListButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleAddToList(data);
      });
    }
  }

  async handleAddToCart(product, button) {
    button.classList.add('loading');
    button.disabled = true;
    const loadingTemplate = document.getElementById('buttonLoadingTemplate');
    if (loadingTemplate) {
      button.innerHTML = '';
      button.appendChild(loadingTemplate.content.cloneNode(true));
    }

    try {
      await fetch(`${window.Shopify.routes.root}cart/add.js`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              id: product?.ec_variant_id,
              quantity: 1,
            },
          ],
          sections: 'cart-drawer,cart-icon-bubble',
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const sections = ['cart-icon-bubble', 'cart-drawer'];
          sections.forEach((section) => {
            const sectionHtml = new DOMParser().parseFromString(data.sections[section], 'text/html');
            if (sectionHtml) {
              if (section === 'cart-drawer') {
                document.querySelector(`#CartDrawer`).innerHTML = sectionHtml.querySelector(`#CartDrawer`).innerHTML;
              } else {
                document.querySelector(`#${section}`).innerHTML = sectionHtml.querySelector(`#shopify-section-${section}`).innerHTML;
              }
            }
          });

          // eslint-disable-next-line no-undef
          createToast("Product added to cart", "", "success");
        })
        .catch((error) => {
          // eslint-disable-next-line no-undef
          createToast(error.message, "", "error");
        });
    } finally {
      button.classList.remove('loading');
      button.disabled = false;
      button.textContent = 'Add to List';
    }
  }

  handleAddToList(product) {
    const selectedProducts = {
      productId: `gid://shopify/Product/${product?.ec_product_id}`,
      productVariantId: `gid://shopify/ProductVariant/${product?.ec_variant_id}`,
      url: `${window.Shopify.routes.root}products/${product?.ec_pdp_url}`,
      quantity: 1,
    };

    window.shoppingListModal.selectedProducts = [selectedProducts];
    window.shoppingListModal.open();
  }
};

window.CoveoRenderersModule.FacetRenderer = class FacetRenderer {
  constructor(facetTemplate, facetValueTemplate) {
    this.facetTemplate = facetTemplate;
    this.facetValueTemplate = facetValueTemplate;
    this.checkboxTemplate = document.getElementById('checkbox-template');
  }

  renderFacets(facets, selectedFacets, onFacetSelect, onShowMore) {
    const fragment = document.createDocumentFragment();

    facets.forEach(facet => {
      if (!facet.values || facet.values.length === 0) return
      const facetElement = this.renderFacet(facet, selectedFacets, onFacetSelect, onShowMore);
      fragment.appendChild(facetElement);
    });

    return fragment;
  }

  renderFacet(facet, selectedFacets, onFacetSelect, onShowMore) {

    const clone = this.facetTemplate.content.cloneNode(true);
    const facetTitle = clone.querySelector('.coveo-facet-title');
    const facetValues = clone.querySelector('.coveo-facet-values');

    const labelText = window.CoveoUtilsModule.FacetUtils.formatFacetTitle(facet.field);
    facetTitle.textContent = labelText;

    const facetElement = clone.querySelector('.coveo-facet');
    facetElement.dataset.facetId = facet.facetId;
    facetElement.dataset.facetType = facet.type;

    const toggleButton = clone.querySelector('.coveo-facet-toggle');
    toggleButton.addEventListener('click', () => {
      facetElement.classList.toggle('coveo-facet-collapsed');
    });

    this.renderFacetValues(facetValues, facet, selectedFacets, onFacetSelect);

    if (facet.values && facet.values.length >= facet.numberOfValues) {
      this.addShowMoreButton(facetValues, facet, onShowMore);
    }

    return clone;
  }

  renderFacetValues(container, facet, selectedFacets, onFacetSelect) {
    container.innerHTML = '';

    if (!facet.values || facet.values.length === 0) {
      return;
    }

    if (facet?.domain) {
      this.renderNumericalRanges(container, facet, selectedFacets, onFacetSelect);
    } else {
      this.renderSpecificValues(container, facet, selectedFacets, onFacetSelect);
    }
  }

  renderSpecificValues(container, facet, selectedFacets, onFacetSelect) {
    facet.values.forEach(facetValue => {
      const valueName = facetValue.value;
      const valueCount = facetValue.numberOfResults;
      const isSelected = this.isValueSelected(facet.facetId, valueName, selectedFacets);

      const valueElement = this.createFacetValueElement(
        valueName,
        valueCount,
        isSelected,
        () => onFacetSelect(facet.facetId, valueName, !isSelected, 'specific')
      );

      container.appendChild(valueElement);
    });
  }

  renderNumericalRanges(container, facet, selectedFacets, onFacetSelect) {
    facet.values.forEach(range => {
      const start = range.start;
      const end = range.end;
      const endInclusive = range.endInclusive;
      const count = range.numberOfResults;

      const displayValue = window.CoveoUtilsModule.FacetUtils.formatPriceRange(start, end, endInclusive);
      const isSelected = this.isRangeSelected(facet.facetId, start, end, selectedFacets);

      const rangeElement = this.createFacetValueElement(
        displayValue,
        count,
        isSelected,
        () => onFacetSelect(facet.facetId, { start, end, endInclusive }, !isSelected, 'numericalRange')
      );

      container.appendChild(rangeElement);
    });
  }

  createFacetValueElement(value, count, isSelected, onClick) {
    const clone = this.facetValueTemplate.content.cloneNode(true);

    const nameElement = clone.querySelector('.coveo-facet-value-name');
    const countElement = clone.querySelector('.coveo-facet-value-count');
    const checkbox = clone.querySelector('.coveo-facet-checkbox');
    const checkboxContainer = clone.querySelector('.coveo-checkbox');

    nameElement.textContent = value;
    countElement.textContent = `(${count})`;
    checkbox.checked = isSelected;

    if (isSelected) {
      checkboxContainer.classList.add('checked');
    }

    if (this.checkboxTemplate) {
      const checkboxTemplateClone = this.checkboxTemplate.content.cloneNode(true);
      checkboxContainer.appendChild(checkboxTemplateClone);
    }

    const valueLabel = clone.querySelector('.coveo-facet-value-label');
    valueLabel.addEventListener('click', (event) => {
      event.preventDefault();
      onClick();

      checkbox.checked = !checkbox.checked;
      checkboxContainer.classList.toggle('checked');
    });

    return clone;
  }

  isValueSelected(facetId, value, selectedFacets) {
    return selectedFacets[facetId] && selectedFacets[facetId].includes(value);
  }

  isRangeSelected(facetId, start, end, selectedFacets) {
    if (!selectedFacets[facetId]) return false;
    return selectedFacets[facetId].some(range =>
      range.start === start && range.end === end
    );
  }

  addShowMoreButton(container, facet, onShowMore) {
    const facetId = facet.facetId;
    const facetState = onShowMore.facetState?.[facetId] || {};
    const isExpanded = facetState.isExpanded || false;

    const button = document.createElement('button');
    button.className = isExpanded ? 'coveo-facet-show-less' : 'coveo-facet-show-more';
    button.textContent = isExpanded ? 'Show less' : 'Show more';

    button.addEventListener('click', () => {
      onShowMore(facetId, facet.type, !isExpanded);
    });

    container.appendChild(button);
  }
};
