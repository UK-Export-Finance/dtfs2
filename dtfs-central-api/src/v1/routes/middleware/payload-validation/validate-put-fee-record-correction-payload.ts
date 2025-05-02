import z from 'zod';
import { validateSchema } from '@ukef/dtfs2-common';
import { MongoObjectIdSchema } from './schemas';

/**
 * Schema for validating fee record correction payload.
 */
const PutFeeRecordCorrectionPayloadSchema = z.object({
  user: z.object({ _id: MongoObjectIdSchema }),
});

/**
 * Type definition for fee record correction payload.
 */
export type PutFeeRecordCorrectionPayload = z.infer<typeof PutFeeRecordCorrectionPayloadSchema>;

/**
 * Middleware function to validate fee record correction payload.
 */
export const validatePutFeeRecordCorrectionPayload = validateSchema(PutFeeRecordCorrectionPayloadSchema);
