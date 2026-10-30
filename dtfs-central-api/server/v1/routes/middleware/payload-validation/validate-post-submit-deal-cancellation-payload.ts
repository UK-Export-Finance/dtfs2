import zod from 'zod';
import { AuditDetails, validateSchema, TfmDealCancellation } from '@ukef/dtfs2-common';
import { DEAL_CANCELLATION } from '@ukef/dtfs2-common/schemas';
import { AuditDetailsSchema } from './schemas';

const PostSubmitDealCancellationSchema: zod.ZodType<{ cancellation: TfmDealCancellation; auditDetails: AuditDetails }> = zod.object({
  cancellation: DEAL_CANCELLATION,
  auditDetails: AuditDetailsSchema,
});

export type SubmitDealCancellationPayload = zod.infer<typeof PostSubmitDealCancellationSchema>;

export const validatePostSubmitDealCancellationPayload = validateSchema(PostSubmitDealCancellationSchema);
