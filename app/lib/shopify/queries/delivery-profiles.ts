export const GET_DELIVERY_PROFILES = `
query GetDeliveryProfiles {
  deliveryProfiles(first: 10) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        id
        profileLocationGroups {
          locationGroupZones(first: 30) {
            edges {
              node {
                zone {
                  id
                  name
                  countries {
                    code {
                      countryCode
                      restOfWorld
                    }
                    provinces {
                      name
                      code
                    }
                  }
                }
                methodDefinitions(first: 30) {
                  edges {
                    node {
                      id
                      name
                      active
                      description
                      rateProvider {
                        ... on DeliveryRateDefinition {
                          id
                          price {
                            amount
                            currencyCode
                          }
                    
                        }
                        ... on DeliveryParticipant {
                          carrierService {
                            id
                            formattedName
                            name
                          }
                          fixedFee{
                            amount
                            currencyCode
                          }
                        }
                      }
                      methodConditions {
                        field
                        operator
                        conditionCriteria {
                          __typename
                          ... on MoneyV2 {
                            amount
                            currencyCode
                          }
                          ... on Weight {
                            unit
                            value
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
      }
    }
  }
}

`; 