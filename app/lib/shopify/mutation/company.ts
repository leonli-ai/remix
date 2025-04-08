/**
 * Mutation to create a company contact by associating a customer with a company.
 * This mutation takes a companyId and customerId as input and creates a company contact,
 * establishing the relationship between the customer and the company.
 */
export const COMPANY_ASSIGN_CUSTOMER_AS_CONTACT = `mutation companyAssignCustomerAsContact($companyId: ID!, $customerId: ID!) {
    companyAssignCustomerAsContact(companyId: $companyId, customerId: $customerId) {
      companyContact {
        id
      }
      userErrors {
        field
        message
      }
    }
  }`

/**
 * Mutation to assign roles to a company location.
 * This mutation takes a companyLocationId and an array of rolesToAssign as input,
 * and assigns the specified roles to the company location.
 */
export const COMPANY_LOCATION_ASSIGN_ROLES = `
  mutation companyLocationAssignRoles($companyLocationId: ID!, $rolesToAssign: [CompanyLocationRoleAssign!]!) {
    companyLocationAssignRoles(
      companyLocationId: $companyLocationId,
      rolesToAssign: $rolesToAssign
    ) {
      roleAssignments {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const REVOKE_COMPANY_CONTACT_ROLE = `mutation companyContactRevokeRole($companyContactId: ID!, $companyContactRoleAssignmentId: ID!) {
  companyContactRevokeRole(companyContactId: $companyContactId, companyContactRoleAssignmentId: $companyContactRoleAssignmentId) {
    revokedCompanyContactRoleAssignmentId
    userErrors {
      field
      message
    }
  }
}`;