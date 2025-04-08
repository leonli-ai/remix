(() => {
  // Helper to load script dynamically
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  };

  // Load modules in sequence and initialize
  const init = async () => {
    try {
      // Clear any existing module references
      window.CoveoConfigModule = undefined;
      window.CoveoUtilsModule = undefined;
      window.CoveoRenderersModule = undefined;
      window.CoveoMainModule = undefined;

      // Get module paths from global variable set in Liquid
      const { module1, module2, module3, module4 } = window.coveoModulePaths || {};
      
      if (!module1 || !module2 || !module3 || !module4) {
        console.error('Coveo module paths not defined. Make sure the window.coveoModulePaths variable is set.');
        return;
      }
      
      await loadScript(module1);
      await loadScript(module2);
      await loadScript(module3);
      await loadScript(module4);

      // Initialize when all modules are loaded
      if (document.getElementById('MainContent') && window.CoveoMainModule) {
        const { CoveoSearchResults } = window.CoveoMainModule;
        new CoveoSearchResults();
      }
    } catch (error) {
      console.error('Failed to initialize Coveo Search Results:', error);
    }
  };

  // Start loading modules
  init();
})();
