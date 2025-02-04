import z from 'zod';
import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { UPSERT_TFM_USER_REQUEST_SCHEMA } from '@ukef/dtfs2-common/schemas';

/**
 * We alias this type for extendability, however while it is only an alias
 * we only need to test the original schema
 * @see UPSERT_TFM_USER_REQUEST_SCHEMA
 */
const PUT_TFM_USER_SCHEMA = UPSERT_TFM_USER_REQUEST_SCHEMA;

export type PutTfmUserPayload = z.infer<typeof UPSERT_TFM_USER_REQUEST_SCHEMA>;

export const validateTfmPutUserPayload = createValidationMiddlewareForSchema(PUT_TFM_USER_SCHEMA);
