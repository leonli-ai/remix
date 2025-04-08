export const GET_CATALOGS = `
  query GetCatalogs($query: String!) {
    catalogs(first: 100, query: $query) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
`; 