import z from 'zod';
import { TfmDealCancellation, ZodTypeFromObject } from '../types';

export const DEAL_CANCELLATION: z.ZodObject<ZodTypeFromObject<TfmDealCancellation>> = z
  .object({
    reason: z.string().max(1200),
    bankRequestDate: z.number(),
    effectiveFrom: z.number(),
  })
  .strict();
