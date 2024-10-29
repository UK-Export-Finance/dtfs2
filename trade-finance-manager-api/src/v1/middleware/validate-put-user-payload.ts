import z from 'zod';
import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { CREATE_TFM_USER_REQUEST_SCHEMA } from '@ukef/dtfs2-common/schemas';

const PutUserSchema = CREATE_TFM_USER_REQUEST_SCHEMA;

export type PutUserPayload = z.infer<typeof PutUserSchema>;

export const validatePutUserPayload = createValidationMiddlewareForSchema(PutUserSchema);
