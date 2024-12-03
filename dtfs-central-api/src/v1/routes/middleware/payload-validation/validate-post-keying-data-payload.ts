import z from 'zod';
import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { TfmSessionUserSchema } from './schemas';

const PostKeyingDataSchema = z.object({
  user: TfmSessionUserSchema,
});

export type PostKeyingDataPayload = z.infer<typeof PostKeyingDataSchema>;

export const validatePostKeyingDataPayload = createValidationMiddlewareForSchema(PostKeyingDataSchema);
