import z from 'zod';
import { TfmDealCancellation, ZodTypeFromObject } from '../types';
import { MAX_CHARACTER_COUNT } from '../constants';

/**
 * Deal Cancellation schema to validate an object is of type `TfmDealCancellation`
 */
export const DEAL_CANCELLATION: z.ZodObject<ZodTypeFromObject<TfmDealCancellation>> = z
  .object({
    reason: z.string().max(MAX_CHARACTER_COUNT),
    bankRequestDate: z.number(),
    effectiveFrom: z.number(),
  })
  .strict();
