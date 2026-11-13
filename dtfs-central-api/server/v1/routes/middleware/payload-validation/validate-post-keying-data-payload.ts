import zod from 'zod';
import { validateSchema } from '@ukef/dtfs2-common';
import { TFM_SESSION_USER_SCHEMA } from '@ukef/dtfs2-common/schemas';

const PostKeyingDataSchema = zod.object({
  user: TFM_SESSION_USER_SCHEMA,
});

export type PostKeyingDataPayload = zod.infer<typeof PostKeyingDataSchema>;

export const validatePostKeyingDataPayload = validateSchema(PostKeyingDataSchema);
