import z from 'zod';
import { TfmDealCancellation, createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { DEAL_CANCELLATION } from '@ukef/dtfs2-common/schemas';

const PutDealCancellationSchema: z.ZodType<Partial<TfmDealCancellation>> = DEAL_CANCELLATION.partial();

export type PutDealCancellationPayload = z.infer<typeof PutDealCancellationSchema>;

export const validatePutDealCancellationPayload = createValidationMiddlewareForSchema(PutDealCancellationSchema);
