export const GET_COMPANY_LOCATION_ADDRESS = `
query getCompanyLocationByLocationId($companyLocationId: ID!) {
    companyLocation(id: $companyLocationId) {
      id
      name
      externalId
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
    }
  }
`;

export const GET_COMPANY_LOCATION_PAYMENT_TERMS = `
  query CompanyLocationPaymentTerms($companyLocationId: ID!) {
    companyLocation(id: $companyLocationId) {
      id
      buyerExperienceConfiguration {
        checkoutToDraft
        editableShippingAddress
        payNowOnly
      }
    }
  }
`; 