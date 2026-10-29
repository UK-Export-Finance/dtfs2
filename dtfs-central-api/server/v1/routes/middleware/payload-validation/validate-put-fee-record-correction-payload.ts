import zod from 'zod';
import { validateSchema } from '@ukef/dtfs2-common';
import { MongoObjectIdSchema } from './schemas';

/**
 * Schema for validating fee record correction payload.
 */
const PutFeeRecordCorrectionPayloadSchema = zod.object({
  user: zod.object({ _id: MongoObjectIdSchema }),
});

/**
 * Type definition for fee record correction payload.
 */
export type PutFeeRecordCorrectionPayload = zod.infer<typeof PutFeeRecordCorrectionPayloadSchema>;

/**
 * Middleware function to validate fee record correction payload.
 */
export const validatePutFeeRecordCorrectionPayload = validateSchema(PutFeeRecordCorrectionPayloadSchema);
