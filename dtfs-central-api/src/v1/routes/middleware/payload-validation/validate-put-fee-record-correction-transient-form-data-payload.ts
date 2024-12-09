import z from 'zod';
import {
  createValidationMiddlewareForSchema,
  MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT,
  RECORD_CORRECTION_REASON,
  RecordCorrectionReason,
} from '@ukef/dtfs2-common';
import { TfmSessionUserSchema } from './schemas';

/**
 * Schema for validating record correction reasons are of type
 * {@link RecordCorrectionReason} using Zod enum.
 */
const RecordCorrectionReasonSchema = z.enum(Object.values(RECORD_CORRECTION_REASON) as [RecordCorrectionReason, ...RecordCorrectionReason[]]);

/**
 * Schema for validating fee record correction transient form data payload.
 * Includes user information and form data with reasons and additional info.
 */
const PutFeeRecordCorrectionTransientFormDataPayload = z.object({
  user: TfmSessionUserSchema,
  formData: z.object({
    reasons: z.array(RecordCorrectionReasonSchema).min(1),
    additionalInfo: z.string().min(1).max(MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT),
  }),
});

/**
 * Type definition for fee record correction transient form data payload.
 */
export type PutFeeRecordCorrectionTransientFormDataPayload = z.infer<typeof PutFeeRecordCorrectionTransientFormDataPayload>;

/**
 * Middleware function to validate fee record correction transient form data payload.
 */
export const validatePutFeeRecordCorrectionTransientFormDataPayload = createValidationMiddlewareForSchema(PutFeeRecordCorrectionTransientFormDataPayload);
