export const GET_COMPANY_LOCATIONS = `
query GetCompanyLocations($companyId: ID!, $first: Int, $after: String, $query: String, $last: Int, $before: String) {
    company(id: $companyId) {
        locationsCount{
            count
            precision
        }
      locations(first: $first, after: $after, query: $query, last: $last, before: $before) {
        edges {
          cursor
          node {
            id
            name
            buyerExperienceConfiguration{
            paymentTermsTemplate{
              description
              dueInDays
              id
              name
              paymentTermsType
              translatedName
              }
            }
            shippingAddress {
              firstName
              lastName
              address1
              address2
              city
              companyName
              country
              countryCode
              zip
              province
              recipient
              zoneCode
              phone
            }

             billingAddress {
              firstName
              lastName
              address1
              address2
              city
              companyName
              country
              countryCode
              zip
              province
              recipient
              zoneCode
              phone
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
          hasPreviousPage
          startCursor
        }
       
      }
    }
  }
`;

/**
 * Query to get basic company information
 * Returns company ID and name
 */
export const GET_COMPANY = `
  query GetCompany($companyId: ID!) {
    company(id: $companyId) {
      id
      name
    }
  }
`;

/**
 * Query to get contact roles for a company location.
 * This query takes a companyLocationId as input and returns the contact roles associated with that location.
 */

export const GET_CONTACT_ROLES = `query GetCompanyLocation($id: ID!) {
  companyLocation(id: $id) {
  # CompanyLocation fields
  company{
      contactRoles(first: 2){
          nodes{
              id
              name
              note
          }
      }
  }
}
}`