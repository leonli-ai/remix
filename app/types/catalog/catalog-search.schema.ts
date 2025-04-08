import { z } from 'zod';

// Request schema
export const catalogSearchRequestSchema = z.object({
  storeName: z.string().min(1, 'Store name is required'),
  query: z.string().min(1, 'Search query is required')
}).strict(); 