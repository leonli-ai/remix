export const queryAdminPortalCompanies = `
    {
     companies(first: 100) {
       edges {
         node {
           id
           name
         }
       }
     }
   }
`