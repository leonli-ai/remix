// Configuration and utility modules
window.CoveoConfigModule = window.CoveoConfigModule || {};

// Define CoveoConfig directly as a property of the module
window.CoveoConfigModule.CoveoConfig = {
  orgId: window.coveoShopify?.orgId || 'aaxispartnerorggxlmz1i4',
  apiToken: window.coveoShopify?.apiToken || 'xx9d575efe-fe2b-49ce-8fc0-05f17e157e2d',
  resultsPerPage: 12,
  facets: [
    {
      filterFacetCount: true,
      injectionDepth: 1000,
      numberOfValues: 8,
      sortCriteria: 'automatic',
      resultsMustMatch: 'atLeastOneValue',
      type: 'specific',
      currentValues: [],
      freezeCurrentValues: false,
      isFieldExpanded: false,
      preventAutoSelect: false,
      facetId: 'ec_category',
      field: 'ec_category',
      tabs: {
        included: [],
        excluded: [],
      },
      activeTab: '',
    },
    {
      filterFacetCount: true,
      injectionDepth: 1000,
      numberOfValues: 8,
      sortCriteria: 'automatic',
      resultsMustMatch: 'atLeastOneValue',
      type: 'specific',
      currentValues: [],
      freezeCurrentValues: false,
      isFieldExpanded: false,
      preventAutoSelect: false,
      facetId: 'ec_brand',
      field: 'ec_brand',
      tabs: {
        included: [],
        excluded: [],
      },
      activeTab: '',
    },
    {
      filterFacetCount: true,
      injectionDepth: 1000,
      numberOfValues: 8,
      sortCriteria: 'ascending',
      rangeAlgorithm: 'equiprobable',
      resultsMustMatch: 'atLeastOneValue',
      currentValues: [],
      preventAutoSelect: false,
      type: 'numericalRange',
      facetId: 'ec_price_dict',
      field: 'ec_price_dict',
      generateAutomaticRanges: true,
      tabs: {},
      activeTab: '',
    },
  ],
};

// Label mappings for facets
window.CoveoConfigModule.labelMap = {
  ec_category: 'Category',
  ec_brand: 'Brand',
  ec_price_dict: 'Price',
}; 