export const GET_FILTERED_COMPANY_CONTACTS = `
query GetFilteredCompanyContacts($companyId: ID!, $first: Int,$last: Int, $after: String,$before: String, $query: String) {
    company(id: $companyId) {
      contactsCount{
        count
        precision
      }
      contacts(first: $first, after: $after, before: $before,last:$last query: $query) {
        edges {
          cursor
          node {
            id
            customer {
              id
              email
              firstName
              lastName
              state
            }
            isMainContact
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

export const GET_COMPANY_CONTACT_DETAIL = `
  query GetCompanyContact($id: ID!) {
    companyContact(id: $id) {
      id
      customer {
        id
        email
        firstName
        lastName
        state
      }
      company {
        id
        name
      }
      isMainContact
    }
  }
`;

export const GET_COMPANY_LOCATION_SHIPPING_ADDRESS = `
  query GetCompanyLocationShippingAddress($companyLocationId: ID!) {
    companyLocation(id: $companyLocationId) {
      id
      name
      shippingAddress {
        address1
        address2
        city
        province
        zip
        country
        countryCode
      }
    }
  }
`;

export const GET_COMPANY_CONTACT_BY_EMAIL = `
  query GetCompanyContactByEmail($companyId: ID!, $emailFilter: String!) {
    company(id: $companyId) {
      contacts(query: $emailFilter, first: 1) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`;

export const GET_COMPANY_CONTACT_PROFILES = `
  query queryCustomer($id: ID!) {
    customer(id: $id) {
      id
      companyContactProfiles {
        id
      }
    }
  }
`;

export const GET_COMPANY_CONTACT_ROLE_ASSIGNMENTS = `
  query GetCompanyContactRoleAssignments($customerId: ID!) {
    customer(id: $customerId) {
      companyContactProfiles {
        id
        roleAssignments(first: 250) {
          edges {
            node {
              id
              companyLocation {
                id
                name
              }
              company {
                id
                name
              }
              role {
                id
                name
              }
            }
          }
        }
      }
    }
  }
`; 