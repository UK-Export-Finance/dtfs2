import z from 'zod';
import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { TFM_SESSION_USER_SCHEMA } from '@ukef/dtfs2-common/schemas';

const PostKeyingDataSchema = z.object({
  user: TFM_SESSION_USER_SCHEMA,
});

export type PostKeyingDataPayload = z.infer<typeof PostKeyingDataSchema>;

export const validatePostKeyingDataPayload = createValidationMiddlewareForSchema(PostKeyingDataSchema);
