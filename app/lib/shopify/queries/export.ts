export const GET_COMPANY_LOCATIONS_AND_CATALOGS = `
  query GetCompanyLocationsAndProducts($companyId: ID!) {
    company(id: $companyId) {
      locations(first: 250) {
        edges {
          node {
            id
            name
            catalogs(first: 250) {
              edges {    
                node {
                  id
                  title
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_CATALOG_PRODUCTS = `
  query GetProducts($catalogId: ID!) {
    catalog(id: $catalogId) {
      publication {
        products(first: 250) {
          edges {
            node {
              id
              title
              variants(first: 250) {
                edges {
                  node {
                    id
                    sku
                    title
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`; 