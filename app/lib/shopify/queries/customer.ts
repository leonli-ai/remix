export const GET_CUSTOMER_DETAILS = `
  query getCustomer($customerId: ID!) {
    customer(id: $customerId) {
      id
      firstName
      lastName
      email
      phone
      state
      companyContactProfiles {
        id
        isMainContact
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
        company {
          id
          name
        }

      }
    }
  }
`; 

export const GET_CUSTOMER_BY_EMAIL = `
  query getCustomerByEmail($email: String!) {
    customers(first: 1, query: $email) {
      edges {
        node {
          id
          email
          firstName
          lastName
          state
        }
      }
    }
  }
`;


export const GET_CUSTOMER_COMPANY_LOCATIONS = `
  query getAllCustomerLocationsByCustomerId($customerId: ID!) {
    customer(id: $customerId) {
      id
      companyContactProfiles {
        company {
          id
          name
          locations(first: 250) {
            edges {
              node {
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



export const GET_CUSTOMER_BY_ID = `
  query GetCustomer($customerId: ID!) {
    customer(id: $customerId) {
      id
      firstName
      lastName
      email
      phone
      state
      createdAt
      updatedAt
    }
  }
`;

export const GET_CUSTOMERS_BY_IDS = `
  query GetCustomers($customerIds: [ID!]!) {
    nodes(ids: $customerIds) {
      ... on Customer {
        id
        firstName
        lastName
        email
        phone
        state
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_CUSTOMER_EMAIL = `
  query getCustomerEmailById($customerId: ID!) {
     customer(id: $customerId) {
      email
      phone
      companyContactProfiles{
        id
        company{
          id
          name
        }
      }
    }
  }
`;

export const GET_CUSTOMER_BY_IDENTIFIER = `
  query getCustomerByEmail($email: String!) {
    customers(first: 1, query: $email) {
      edges {
        node {
          id
          firstName
          lastName
          email
          phone
          state
          companyContactProfiles {
            id
            isMainContact
            company {
              id
              name
              locations(first: 250) {
                edges {
                    node {
                        id
                        name
                        buyerExperienceConfiguration {
                            editableShippingAddress
                        }
                        shippingAddress {
                            address1
                            address2
                            city
                            province
                            zip
                            country
                            phone
                            countryCode
                            companyName
                            firstName
                            lastName
                            zoneCode
                        }
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

export const SEARCH_CUSTOMERS = `
  query SearchCustomers($query: String!) {
    customers(first: 250, query: $query) {
      edges {
        node {
          id
        }
      }
    }
  }
`;