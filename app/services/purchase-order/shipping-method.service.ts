import { loggerService } from '~/lib/logger';
import { ShopifyClientManager } from '~/lib/shopify/client';
import { GET_DELIVERY_PROFILES } from '~/lib/shopify/queries/delivery-profiles';
import type { 
  GetShippingMethodsParams,
  EligibleShippingMethod,
  MethodCondition
} from '~/types/shipping/shipping-method.schema';
import { GetShippingMethodsParamsSchema } from '~/types/shipping/shipping-method.schema';

export class ShippingMethodService {
  /**
   * Get eligible shipping methods for a given address and order details
   */
  public async getEligibleShippingMethods(params: GetShippingMethodsParams): Promise<EligibleShippingMethod[]> {
    try {
      // Validate input parameters
      GetShippingMethodsParamsSchema.parse(params);

      // Fetch delivery profiles from Shopify
      const response = await ShopifyClientManager.query(
        GET_DELIVERY_PROFILES,
        params.storeName
      );

      if (response.errors) {
        throw new Error(`Failed to fetch delivery profiles: ${JSON.stringify(response.errors)}`);
      }

      const eligibleMethods: EligibleShippingMethod[] = [];
      
      // Process each delivery profile
      response.data.deliveryProfiles.edges.forEach((profileEdge: any) => {
        const profile = profileEdge.node;
        
        // Process each location group
        profile.profileLocationGroups.forEach((locationGroup: any) => {
          // Process each zone
          locationGroup.locationGroupZones.edges.forEach((zoneEdge: any) => {
            const zoneNode = zoneEdge.node;
            const zone = zoneNode.zone;
            
            // Check if user's address is in the current zone
            if (this.isAddressInZone(zone, params.countryCode, params.provinceCode)) {
              // Process each shipping method in the zone
              zoneNode.methodDefinitions.edges.forEach((methodEdge: any) => {
                const method = methodEdge.node;
                loggerService.info('Shipping Method: ', {
                  method    
                });
                // Check if method is active and conditions are met
                if (method.active && this.areConditionsMet(method.methodConditions, params)) {
                  const rateProvider = method.rateProvider;
                  let rateProviderData;

                  if ('price' in rateProvider) {
                    // This is a DeliveryRateDefinition
                    rateProviderData = {
                      type: 'DeliveryRateDefinition' as const,
                      definition: {
                        id: rateProvider.id,
                        price: {
                          amount: rateProvider.price.amount,
                          currencyCode: rateProvider.price.currencyCode
                        }
                      }
                    };
                  } else if ('carrierService' in rateProvider) {
                    // This is a DeliveryParticipant
                    rateProviderData = {
                      type: 'DeliveryParticipant' as const,
                      participant: {
                        carrierService: {
                          id: rateProvider.carrierService.id,
                          formattedName: rateProvider.carrierService.formattedName,
                          name: rateProvider.carrierService.name
                        },
                        fixedFee: {
                          amount: rateProvider.fixedFee.amount,
                          currencyCode: rateProvider.fixedFee.currencyCode
                        }
                      }
                    };
                  } else {
                    // Fallback for unknown type
                    rateProviderData = {
                      type: 'DeliveryRateDefinition' as const,
                      definition: {
                        id: '',
                        price: {
                          amount: '0',
                          currencyCode: 'USD'
                        }
                      }
                    };
                  }

                  eligibleMethods.push({
                    id: method.id,
                    name: method.name,
                    description: method.description,
                    active: method.active,
                    rateProvider: rateProviderData
                  });
                }
              });
            }
          });
        });
      });

      return eligibleMethods;
    } catch (error) {
      loggerService.error('Error getting eligible shipping methods', {
        error,
        params
      });
      throw error;
    }
  }

  /**
   * Check if an address is within a delivery zone
   */
  private isAddressInZone(
    zone: any, 
    countryCode: string, 
    provinceCode?: string
  ): boolean {
    let isInZone = false;
    
    // Check each country in the zone
    zone.countries.forEach((country: any) => {
      if (country.code.countryCode === countryCode || country.code.restOfWorld) {
        if (country.provinces && country.provinces.length > 0) {
          // If provinces are specified, check province match
          if (provinceCode) {
            isInZone = country.provinces.some(
              (province: any) => province.code === provinceCode
            );
          }
        } else {
          // If no provinces specified, entire country is in zone
          isInZone = true;
        }
      }
    });
    
    return isInZone;
  }

  /**
   * Check if order meets all conditions for a shipping method
   */
  private areConditionsMet(
    conditions: MethodCondition[], 
    params: GetShippingMethodsParams
  ): boolean {
    if (!conditions || conditions.length === 0) {
      return true;
    }

    return conditions.every(condition => {
      switch (condition.field) {
        case 'PRICE':
          return this.checkPriceCondition(condition, params.orderTotal);
        case 'WEIGHT':
          return params.orderWeight ? 
            this.checkWeightCondition(condition, params.orderWeight) : 
            true;
        default:
          return true;
      }
    });
  }

  /**
   * Check if order price meets the condition
   */
  private checkPriceCondition(condition: MethodCondition, orderTotal: number): boolean {
    if (condition.conditionCriteria.__typename !== 'MoneyV2') {
      return true;
    }
    
    const criteriaAmount = parseFloat(condition.conditionCriteria.amount);
    
    switch (condition.operator) {
      case 'GREATER_THAN':
        return orderTotal > criteriaAmount;
      case 'LESS_THAN':
        return orderTotal < criteriaAmount;
      case 'GREATER_THAN_OR_EQUAL_TO':
        return orderTotal >= criteriaAmount;
      case 'LESS_THAN_OR_EQUAL_TO':
        return orderTotal <= criteriaAmount;
      default:
        return true;
    }
  }

  /**
   * Check if order weight meets the condition
   */
  private checkWeightCondition(condition: MethodCondition, orderWeight: number): boolean {
    if (condition.conditionCriteria.__typename !== 'Weight') {
      return true;
    }

    const criteriaWeight = parseFloat(condition.conditionCriteria.value);
    
    switch (condition.operator) {
      case 'GREATER_THAN':
        return orderWeight > criteriaWeight;
      case 'LESS_THAN':
        return orderWeight < criteriaWeight;
      case 'GREATER_THAN_OR_EQUAL_TO':
        return orderWeight >= criteriaWeight;
      case 'LESS_THAN_OR_EQUAL_TO':
        return orderWeight <= criteriaWeight;
      default:
        return true;
    }
  }
} 