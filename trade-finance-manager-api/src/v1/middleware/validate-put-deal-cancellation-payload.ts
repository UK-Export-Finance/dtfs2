import z from 'zod';
import { validateSchema } from '@ukef/dtfs2-common';
import { DEAL_CANCELLATION } from '@ukef/dtfs2-common/schemas';

const PutDealCancellationSchema = DEAL_CANCELLATION.partial();

export type PutDealCancellationPayload = z.infer<typeof PutDealCancellationSchema>;

export const validatePutDealCancellationPayload = validateSchema(PutDealCancellationSchema);
