export const REVOKE_COMPANY_CONTACT_ROLE = `
  mutation companyContactRevokeRole($companyContactId: ID!, $companyContactRoleAssignmentId: ID!) {
    companyContactRevokeRole(
      companyContactId: $companyContactId, 
      companyContactRoleAssignmentId: $companyContactRoleAssignmentId
    ) {
      revokedCompanyContactRoleAssignmentId
      userErrors {
        field
        message
      }
    }
  }
`;

export const DELETE_COMPANY_CONTACT = `
  mutation companyContactDelete($companyContactId: ID!) {
    companyContactDelete(companyContactId: $companyContactId) {
      deletedCompanyContactId
      userErrors {
        field
        message
      }
    }
  }
`; 