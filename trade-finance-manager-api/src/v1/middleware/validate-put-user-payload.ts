import z from 'zod';
import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { USER_UPSERT_REQUEST_SCHEMA } from '@ukef/dtfs2-common/schemas';

const PutUserSchema = USER_UPSERT_REQUEST_SCHEMA;

export type PutUserPayload = z.infer<typeof PutUserSchema>;

export const validatePutUserPayload = createValidationMiddlewareForSchema(PutUserSchema);
