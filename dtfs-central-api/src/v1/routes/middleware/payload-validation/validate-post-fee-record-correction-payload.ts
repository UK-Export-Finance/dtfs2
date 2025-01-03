import z from 'zod';
import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { TFM_SESSION_USER_SCHEMA } from '@ukef/dtfs2-common/schemas';

const PostFeeRecordCorrectionSchema = z.object({
  user: TFM_SESSION_USER_SCHEMA,
});

export type PostFeeRecordCorrectionPayload = z.infer<typeof PostFeeRecordCorrectionSchema>;

/**
 * Validates the payload for the post fee record correction route
 */
export const validatePostFeeRecordCorrectionPayload = createValidationMiddlewareForSchema(PostFeeRecordCorrectionSchema);
