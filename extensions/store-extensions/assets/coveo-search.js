(function () {
  // Cache to store search results and reduce redundant API requests
  const searchCache = new Map();
  const querySuggestCache = new Map();
  
  // Use more selectors to find search form, improving compatibility
  const findSearchForm = () => {
    const selectors = [
      'partner-search form',
      'form[action*="/search"]',
      '.search-form',
      '.header__search form',
      '#search-form',
      'header form[role="search"]',
      '.search-bar form'
    ];

    for (const selector of selectors) {
      const form = document.querySelector(selector);
      if (form) return form;
    }
    return null;
  };

  // Initialize Coveo search
  const initCoveoSearch = () => {
    const config = {
      orgId: window.coveoShopify?.orgId || "aaxispartnerorggxlmz1i4",
      apiToken: window.coveoShopify?.apiToken || "xx9d575efe-fe2b-49ce-8fc0-05f17e157e2d",
    };

    window.coveoShopify = { ...window.coveoShopify, ...config };

    const searchForm = findSearchForm();
    if (!searchForm) {
      console.error("Coveo Search: Could not find search form");
      return false;
    }

    // Clear form and add required attributes
    searchForm.innerHTML = '';
    searchForm.setAttribute('novalidate', true);
    searchForm.classList.add('coveo-search-form');

    const formContentTemplate = document.getElementById('coveoSearchFormContentTemplate');
    if (!formContentTemplate) {
      console.error("Coveo Search: Missing required template");
      return false;
    }

    // Use fragment to optimize DOM operations
    const fragment = document.createDocumentFragment();
    fragment.appendChild(document.importNode(formContentTemplate.content, true));
    searchForm.appendChild(fragment);

    // Get DOM elements
    const elements = {
      input: document.getElementById('coveoSearchInput'),
      submit: document.getElementById('coveoSubmitBtn'),
      clear: document.getElementById('coveoClearBtn'),
      suggestions: document.getElementById('coveoSuggestions')
    };

    // Return early if elements don't exist
    if (!elements.input || !elements.suggestions) {
      console.error("Coveo Search: Missing required DOM elements");
      return false;
    }

    // Get query parameter from URL
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');
    if (queryParam) {
      elements.input.value = queryParam;
      elements.clear.classList.remove('coveo-hidden');
    }

    let debounceTimer;
    const DEBOUNCE_DELAY = 300; // Extract constant for easier maintenance

    // API request helper - with error handling and retry logic
    const apiRequest = async (query, retryCount = 0) => {
      const cacheKey = query.toLowerCase();
      
      // Check if results exist in cache
      if (searchCache.has(cacheKey)) {
        return searchCache.get(cacheKey);
      }

      const companyId = localStorage.getItem('company-id');
      
      try {
        const response = await fetch(
          `https://${config.orgId}.org.coveo.com/rest/search/v2`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${config.apiToken}`
            },
            body: JSON.stringify({
              q: query,
              debug: false,
              searchHub: 'AdminConsole',
              pipeline: "default",
              locale: 'en-US',
              numberOfResults: 5,
              enableDidYouMean: true,
              enableQuerySyntax: false,
              sortCriteria: 'relevancy',
              dictionaryFieldContext: {
                ec_customer_part_number_dict: companyId,
              },
              tab: 'default',
              aq: '@objecttype==Product',
            })
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error (${response.status}): ${errorText}`);
        }
        
        const data = await response.json();
        
        // Cache results to improve performance
        searchCache.set(cacheKey, data);
        
        // Limit cache size
        if (searchCache.size > 20) {
          const firstKey = searchCache.keys().next().value;
          searchCache.delete(firstKey);
        }
        
        return data;
      } catch (error) {
        console.error("Coveo API request failed:", error);
        
        // Retry logic - up to 2 retries
        if (retryCount < 2) {
          console.log(`Attempting to retry request, attempt ${retryCount + 1}...`);
          return await new Promise(resolve => {
            setTimeout(() => resolve(apiRequest(query, retryCount + 1)), 500);
          });
        }
        
        return null;
      }
    };

    // Query suggestion API request helper
    const fetchQuerySuggestions = async (query, retryCount = 0) => {
      const cacheKey = query.toLowerCase();
      
      // Check if results exist in cache
      if (querySuggestCache.has(cacheKey)) {
        return querySuggestCache.get(cacheKey);
      }
      
      try {
        const response = await fetch(
          `https://${config.orgId}.org.coveo.com/rest/search/v2/querySuggest`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${config.apiToken}`
            },
            body: JSON.stringify({
              q: query,
              locale: 'en-US',
              count: 3,
              searchHub: 'AdminConsole',
              tab: 'default',
              pipeline: "default",
            })
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Query Suggest API error (${response.status}): ${errorText}`);
        }
        
        const data = await response.json();
        
        // Cache results to improve performance
        querySuggestCache.set(cacheKey, data);
        
        // Limit cache size
        if (querySuggestCache.size > 20) {
          const firstKey = querySuggestCache.keys().next().value;
          querySuggestCache.delete(firstKey);
        }
        
        return data;
      } catch (error) {
        console.error("Coveo Query Suggest API request failed:", error);
        
        // Retry logic - up to 1 retry
        if (retryCount < 1) {
          return await new Promise(resolve => {
            setTimeout(() => resolve(fetchQuerySuggestions(query, retryCount + 1)), 500);
          });
        }
        
        return null;
      }
    };

    // Get product suggestions
    const getProductSuggestions = async (query) => {
      if (!query.trim()) {
        elements.suggestions.classList.add('coveo-hidden');
        elements.suggestions.innerHTML = "";
        return;
      }
      
      // Show loading state
      elements.input.classList.add('coveo-loading');
      
      // Fetch both product suggestions and query suggestions in parallel
      const [productResponse, querySuggestResponse] = await Promise.all([
        apiRequest(query),
        fetchQuerySuggestions(query)
      ]);
      
      // Remove loading state
      elements.input.classList.remove('coveo-loading');
      
      const hasProducts = productResponse?.results && productResponse.results.length > 0;
      const hasQuerySuggestions = querySuggestResponse?.completions && querySuggestResponse.completions.length > 0;
      
      if (!hasProducts && !hasQuerySuggestions) {
        elements.suggestions.classList.add('coveo-hidden');
        return;
      }

      // Use DocumentFragment to optimize DOM operations
      const suggestionsFragment = document.createDocumentFragment();
      elements.suggestions.innerHTML = "";

      // Add query suggestions if available
      if (hasQuerySuggestions) {
        // Add query suggestions header
        suggestionsFragment.appendChild(
          document.importNode(
            document.getElementById('coveoQuerySuggestionHeaderTemplate').content,
            true
          )
        );

        // Add query suggestions
        querySuggestResponse.completions.forEach(suggestion => {
          const itemFragment = document.importNode(
            document.getElementById('coveoQuerySuggestionTemplate').content,
            true
          );

          const li = itemFragment.querySelector('li');
          const text = li.querySelector('.coveo-query-suggestion-text');
          
          text.textContent = suggestion.expression;
          
          // Store the suggestion for easy access when clicked
          li.dataset.suggestion = suggestion.expression;
          
          suggestionsFragment.appendChild(itemFragment);
        });

        // Add separator if we also have products
        if (hasProducts) {
          suggestionsFragment.appendChild(
            document.importNode(
              document.getElementById('coveoSeparatorTemplate').content,
              true
            )
          );
        }
      }

      // Add product suggestions if available
      if (hasProducts) {
        // Add header
        suggestionsFragment.appendChild(
          document.importNode(
            document.getElementById('coveoProductHeaderTemplate').content,
            true
          )
        );

        // Add product suggestions
        productResponse.results.forEach(result => {
          const itemFragment = document.importNode(
            document.getElementById('coveoProductSuggestionTemplate').content,
            true
          );

          const li = itemFragment.querySelector('li');
          const img = li.querySelector('img');
          const title = li.querySelector('.coveo-product-suggestion-title');
          const sku = li.querySelector('.coveo-product-suggestion-sku');
          const partnerNumber = li.querySelector('.coveo-customer-partner-number');
          const imageSrc = result.raw.ec_images?.[0] || 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png';
          
          // Set image attributes, including missing width and height
          img.src = imageSrc;
          img.alt = result.title || '';
          img.width = 60;
          img.height = 60;
          img.loading = 'lazy'; // Lazy loading for better performance
          
          title.textContent = result.title;
          sku.textContent = result.raw.ec_sku || '';
          partnerNumber.textContent = result.raw.ec_customer_part_number_dict || '';
          
          // Use event delegation instead of individual event listeners
          li.dataset.url = result.clickUri;
          
          suggestionsFragment.appendChild(itemFragment);
        });

        // Add "See all" link
        const seeAllFragment = document.importNode(
          document.getElementById('coveoSeeAllResultsTemplate').content,
          true
        );
        const link = seeAllFragment.querySelector('.coveo-see-all-link');
        link.href = `/search?q=${encodeURIComponent(query)}`;
        suggestionsFragment.appendChild(seeAllFragment);

        elements.suggestions.appendChild(suggestionsFragment);
        elements.suggestions.classList.remove('coveo-hidden');
      } else {
        elements.suggestions.classList.add('coveo-hidden');
      }
    };

    // Use event delegation to handle suggestion item clicks
    elements.suggestions.addEventListener('click', (e) => {
      const productSuggestion = e.target.closest('.coveo-product-suggestion');
      const querySuggestion = e.target.closest('.coveo-query-suggestion');
      
      if (productSuggestion && productSuggestion.dataset.url) {
        window.location.href = productSuggestion.dataset.url;
      } else if (querySuggestion && querySuggestion.dataset.suggestion) {
        // Handle query suggestion click
        elements.input.value = querySuggestion.dataset.suggestion;
        elements.suggestions.classList.add('coveo-hidden');
        elements.clear.classList.remove('coveo-hidden');
        
        // Submit the form with the selected suggestion
        searchForm.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    });

    // Input event handling
    elements.input.addEventListener("input", (e) => {
      const query = e.target.value.trim();

      elements.clear.classList.toggle('coveo-hidden', !query);
      clearTimeout(debounceTimer);

      if (query) {
        debounceTimer = setTimeout(() => getProductSuggestions(query), DEBOUNCE_DELAY);
      } else {
        elements.suggestions.classList.add('coveo-hidden');
        elements.suggestions.innerHTML = "";
      }
    });

    // Form submission handling
    searchForm.addEventListener('submit', (e) => {
      const query = elements.input.value.trim();
      if (!query) {
        e.preventDefault(); // Prevent submitting empty queries
        return;
      }
      elements.suggestions.classList.add('coveo-hidden');
    });

    // Clear button event
    elements.clear.addEventListener("click", () => {
      elements.input.value = "";
      elements.clear.classList.add('coveo-hidden');
      elements.suggestions.classList.add('coveo-hidden');
      elements.suggestions.innerHTML = "";
      
      // Focus back to search box
      elements.input.focus();
      
      // Remove query parameter from URL without page refresh
      const url = new URL(window.location.href);
      if (url.searchParams.has('q')) {
        url.searchParams.delete('q');
        window.history.replaceState({}, '', url.toString());
      }
      
      // Make an API request with empty query to refresh search results
      apiRequest("");
      window.location.reload();
    });

    // Close suggestions when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest('.coveo-search-container') &&
        !e.target.closest('#coveoSuggestions')) {
        elements.suggestions.classList.add('coveo-hidden');
      }
    });

    // Add keyboard navigation support
    elements.input.addEventListener('keydown', (e) => {
      if (elements.suggestions.classList.contains('coveo-hidden')) return;
      
      const suggestions = elements.suggestions.querySelectorAll('.coveo-suggestion-item');
      if (!suggestions.length) return;
      
      let focusedIndex = Array.from(suggestions).findIndex(item => 
        item.classList.contains('focused'));
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (focusedIndex < 0) {
            focusedIndex = 0;
          } else {
            focusedIndex = (focusedIndex + 1) % suggestions.length;
          }
          updateFocus(suggestions, focusedIndex);
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          if (focusedIndex < 0) {
            focusedIndex = suggestions.length - 1;
          } else {
            focusedIndex = (focusedIndex - 1 + suggestions.length) % suggestions.length;
          }
          updateFocus(suggestions, focusedIndex);
          break;
          
        case 'Enter':
          if (focusedIndex >= 0) {
            e.preventDefault();
            const focusedItem = suggestions[focusedIndex];
            
            if (focusedItem.classList.contains('coveo-product-suggestion') && focusedItem.dataset.url) {
              window.location.href = focusedItem.dataset.url;
            } else if (focusedItem.classList.contains('coveo-query-suggestion') && focusedItem.dataset.suggestion) {
              elements.input.value = focusedItem.dataset.suggestion;
              elements.suggestions.classList.add('coveo-hidden');
              elements.clear.classList.remove('coveo-hidden');
              searchForm.dispatchEvent(new Event('submit', { cancelable: true }));
            }
          }
          break;
          
        case 'Escape':
          elements.suggestions.classList.add('coveo-hidden');
          elements.input.focus();
          break;
      }
    });
    
    // Helper function to update focus
    function updateFocus(suggestions, index) {
      suggestions.forEach(item => item.classList.remove('focused'));
      if (index >= 0 && index < suggestions.length) {
        suggestions[index].classList.add('focused');
        suggestions[index].scrollIntoView({ block: 'nearest' });
      }
    }

    // Initial clear button visibility
    if (elements.input.value) {
      elements.clear.classList.remove('coveo-hidden');
    }

    return true;
  };

  // Initialize on page load
  const initOnLoad = () => {
    if (!initCoveoSearch()) {
      // Use MutationObserver to wait for DOM to be ready
      const observer = new MutationObserver(() => {
        if (findSearchForm()) {
          observer.disconnect();
          initCoveoSearch();
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      // Set timeout to ensure initialization eventually happens
      setTimeout(() => {
        if (!document.querySelector('.coveo-search-form')) {
          initCoveoSearch();
          observer.disconnect();
        }
      }, 2000);
    }
  };

  // Check if document is already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOnLoad);
  } else {
    initOnLoad();
  }
})();
