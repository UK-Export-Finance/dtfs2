import zod from 'zod';
import { AuditDetails, validateSchema } from '@ukef/dtfs2-common';
import { AuditDetailsSchema } from './schemas';

const DeleteDealCancellationSchema: zod.ZodType<{ auditDetails: AuditDetails }> = zod.object({
  auditDetails: AuditDetailsSchema,
});

export type DeleteDealCancellationPayload = zod.infer<typeof DeleteDealCancellationSchema>;

export const validateDeleteDealCancellationPayload = validateSchema(DeleteDealCancellationSchema);
