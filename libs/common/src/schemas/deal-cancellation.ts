import z from 'zod';
import { MAX_CHARACTER_COUNT } from '../constants';

/**
 * Deal Cancellation schema to validate an object is of type `TfmDealCancellationWithoutStatus`
 */
export const DEAL_CANCELLATION = z
  .object({
    reason: z.string().max(MAX_CHARACTER_COUNT),
    bankRequestDate: z.number(),
    effectiveFrom: z.number(),
  })
  .strict();
