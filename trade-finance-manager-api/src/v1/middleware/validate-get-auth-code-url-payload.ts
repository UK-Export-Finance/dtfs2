import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { GET_AUTH_CODE_REQUEST_SCHEMA } from '@ukef/dtfs2-common/schemas';

export const validateGetAuthCodePayloadUrl = createValidationMiddlewareForSchema(GET_AUTH_CODE_REQUEST_SCHEMA);
