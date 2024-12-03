import z from 'zod';
import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { DEAL_CANCELLATION } from '@ukef/dtfs2-common/schemas';

const PostSubmitDealCancellationSchema = DEAL_CANCELLATION;

export type PostSubmitDealCancellationPayload = z.infer<typeof PostSubmitDealCancellationSchema>;

export const validatePostSubmitDealCancellationPayload = createValidationMiddlewareForSchema(PostSubmitDealCancellationSchema);
