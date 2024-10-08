import z from 'zod';
import { TfmSessionUserSchema } from './schemas';
import { createValidationMiddlewareForSchema } from './create-validation-middleware-for-schema';

const PostKeyingDataSchema = z.object({
  user: TfmSessionUserSchema,
});

export type PostKeyingDataPayload = z.infer<typeof PostKeyingDataSchema>;

export const validatePostKeyingDataPayload = createValidationMiddlewareForSchema(PostKeyingDataSchema);
