import zod from 'zod';
import { validateSchema } from '@ukef/dtfs2-common';
import { TFM_SESSION_USER_SCHEMA } from '@ukef/dtfs2-common/schemas';

const PostFeeRecordCorrectionSchema = zod.object({
  user: TFM_SESSION_USER_SCHEMA,
});

export type PostFeeRecordCorrectionPayload = zod.infer<typeof PostFeeRecordCorrectionSchema>;

/**
 * Validates the payload for the post fee record correction route
 */
export const validatePostFeeRecordCorrectionPayload = validateSchema(PostFeeRecordCorrectionSchema);
