import z from 'zod';
import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { TfmSessionUserSchema } from './schemas';

const PostFeeRecordCorrectionSchema = z.object({
  user: TfmSessionUserSchema,
});

export type PostFeeRecordCorrectionPayload = z.infer<typeof PostFeeRecordCorrectionSchema>;

/**
 * Validates the payload for the post fee record correction route
 */
export const validatePostFeeRecordCorrectionPayload = createValidationMiddlewareForSchema(PostFeeRecordCorrectionSchema);
