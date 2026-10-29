import zod from 'zod';
import { MAX_CHARACTER_COUNT } from '@ukef/constants';

/**
 * Deal Cancellation schema to validate an object is of type `TfmDealCancellation`
 */
export const DEAL_CANCELLATION = z
  .object({
    reason: zod.string().max(MAX_CHARACTER_COUNT),
    bankRequestDate: zod.number(),
    effectiveFrom: zod.number(),
  })
  .strict();
