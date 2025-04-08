import { z } from 'zod';

export const CountryCodeSchema = z.object({
  countryCode: z.string(),
  restOfWorld: z.boolean()
});

export const ProvinceSchema = z.object({
  name: z.string(),
  code: z.string()
});

export const ConditionCriteriaSchema = z.discriminatedUnion('__typename', [
  z.object({
    __typename: z.literal('MoneyV2'),
    amount: z.string(),
    currencyCode: z.string()
  }),
  z.object({
    __typename: z.literal('Weight'),
    unit: z.string(),
    value: z.string()
  })
]);

export const MethodConditionSchema = z.object({
  field: z.string(),
  operator: z.string(),
  conditionCriteria: ConditionCriteriaSchema
});

export const ShippingMethodSchema = z.object({
  id: z.string(),
  active: z.boolean(),
  description: z.string(),
  methodConditions: z.array(MethodConditionSchema)
});

export const GetShippingMethodsParamsSchema = z.object({
  storeName: z.string(),
  countryCode: z.string(),
  provinceCode: z.string().optional(),
  orderTotal: z.number(),
  orderWeight: z.number().optional()
});

export type CountryCode = z.infer<typeof CountryCodeSchema>;
export type Province = z.infer<typeof ProvinceSchema>;
export type ConditionCriteria = z.infer<typeof ConditionCriteriaSchema>;
export type MethodCondition = z.infer<typeof MethodConditionSchema>;
export type ShippingMethod = z.infer<typeof ShippingMethodSchema>;
export type GetShippingMethodsParams = z.infer<typeof GetShippingMethodsParamsSchema>;

export type RateProviderPrice = {
  amount: string;
  currencyCode: string;
};

export type DeliveryRateDefinition = {
  id: string;
  price: RateProviderPrice;
};

export type DeliveryParticipant = {
  carrierService: {
    id: string;
    formattedName: string;
    name: string;
  };
  fixedFee: RateProviderPrice;
};

export type EligibleShippingMethod = {
  id: string;
  name: string;
  description: string;
  active: boolean;
  rateProvider: {
    type: 'DeliveryRateDefinition' | 'DeliveryParticipant';
    definition?: DeliveryRateDefinition;
    participant?: DeliveryParticipant;
  };
}; 