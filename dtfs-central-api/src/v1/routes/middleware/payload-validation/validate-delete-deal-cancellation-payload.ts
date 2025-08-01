import z from 'zod';
import { AuditDetails, validateSchema } from '@ukef/dtfs2-common';
import { AuditDetailsSchema } from './schemas';

const DeleteDealCancellationSchema: z.ZodType<{ auditDetails: AuditDetails }> = z.object({
  auditDetails: AuditDetailsSchema,
});

export type DeleteDealCancellationPayload = z.infer<typeof DeleteDealCancellationSchema>;

export const validateDeleteDealCancellationPayload = validateSchema(DeleteDealCancellationSchema);
