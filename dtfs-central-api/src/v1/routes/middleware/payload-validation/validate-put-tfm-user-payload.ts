import z from 'zod';
import { AuditDetails, UserUpsertRequest, createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { USER_UPSERT_REQUEST_SCHEMA } from '@ukef/dtfs2-common/schemas';
import { AuditDetailsSchema } from './schemas';

const PutTfmUserSchema: z.ZodType<{ userUpdateFromEntraIdUser: UserUpsertRequest; auditDetails: AuditDetails }> = z.object({
  userUpdateFromEntraIdUser: USER_UPSERT_REQUEST_SCHEMA,
  auditDetails: AuditDetailsSchema,
});

export type PutTfmUserPayload = z.infer<typeof PutTfmUserSchema>;

export const validatePutTfmUserPayload = createValidationMiddlewareForSchema(PutTfmUserSchema);
