export const CREATE_CUSTOMER = `
  mutation customerCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        firstName
        lastName
        state
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const DELETE_CUSTOMER = `
  mutation customerDelete($id: ID!) {
    customerDelete(input: {id: $id}) {
      shop {
        id
      }
      userErrors {
        field
        message
      }
      deletedCustomerId
    }
  }
`;