import { z } from 'zod';
import { VALID_INTERVAL_UNITS } from './subscription-contract-create.schema';

/**
 * Subscription contract status constants
 */
export const SubscriptionContractStatus = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
  COMPLETED: 'completed',
  DECLINED: 'declined'
} as const;

export type SubscriptionContractStatusType = typeof SubscriptionContractStatus[keyof typeof SubscriptionContractStatus];

/**
 * Case-insensitive enum validation
 */
const caseInsensitiveEnum = <T extends readonly string[]>(values: T) => 
  z.string().refine(
    (value) => values.map(v => v.toLowerCase()).includes(value.toLowerCase()),
    (value) => ({ 
      message: `Invalid enum value. Expected ${values.map(v => `'${v}'`).join(' | ')}, received '${value}'` 
    })
  ).transform(value => {
    // Normalize to one of the valid values with correct casing
    const normalizedValue = values.find(v => v.toLowerCase() === value.toLowerCase());
    return normalizedValue as (typeof values)[number];
  });

/**
 * Schema for fetching subscription contracts
 */
export const fetchSubscriptionContractsSchema = z.object({
  storeName: z.string(),
  companyId: z.string().optional(),
  companyLocationId: z.string(),
  filter: z.object({
    name: z.string().optional(),
    status: z.array(z.enum([
      SubscriptionContractStatus.ACTIVE, 
      SubscriptionContractStatus.PAUSED, 
      SubscriptionContractStatus.CANCELLED,
      SubscriptionContractStatus.PENDING,
      SubscriptionContractStatus.COMPLETED,
      SubscriptionContractStatus.DECLINED
    ])).optional(),
    approvedByName: z.string().optional(),
    startDateFrom: z.string().optional(),
    orderNumber: z.number().optional(),
    startDateTo: z.string().optional(),
    frequencyUnit: caseInsensitiveEnum(VALID_INTERVAL_UNITS).optional(),
    frequencyValue: z.number().optional(),
    poNumber: z.string().optional(),
    orderTotalMin: z.number().optional(),
    orderTotalMax: z.number().optional(),
    nextOrderCreationDateFrom: z.string().optional(),
    nextOrderCreationDateTo: z.string().optional(),
  }).optional(),
  pagination: z.object({
    page: z.number().min(1),
    pageSize: z.number().min(1).max(100),
  }),
  sort: z.object({
    field: z.enum(['nextOrderCreationDate', 'createdAt', 'name', 'status', 'orderTotal']),
    order: z.enum(['asc', 'desc']),
  }).optional(),
}).strict();

export type FetchSubscriptionContractsRequest = z.infer<typeof fetchSubscriptionContractsSchema>;

/**
 * Response types for subscription contracts
 */
export interface SubscriptionContractResponse {
  id: number;
  name: string;
  status: SubscriptionContractStatusType;
  orderTotal: number;
  currencyCode: string;
  intervalValue: number;
  intervalUnit: string;
  nextOrderCreationDate: string;
  approvedByName?: string | null;
  poNumber?: string | null;
}

export interface FetchSubscriptionContractsResponse {
  total: number;
  page: number;
  pageSize: number;
  data: SubscriptionContractResponse[];
} 