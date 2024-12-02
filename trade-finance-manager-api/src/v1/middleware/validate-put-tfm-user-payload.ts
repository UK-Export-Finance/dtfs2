import z from 'zod';
import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { CREATE_TFM_USER_REQUEST_SCHEMA } from '@ukef/dtfs2-common/schemas';

const PUT_TFM_USER_SCHEMA = CREATE_TFM_USER_REQUEST_SCHEMA;

export type PutTfmUserPayload = z.infer<typeof PUT_TFM_USER_SCHEMA>;

export const validateTfmPutUserPayload = createValidationMiddlewareForSchema(PUT_TFM_USER_SCHEMA);
