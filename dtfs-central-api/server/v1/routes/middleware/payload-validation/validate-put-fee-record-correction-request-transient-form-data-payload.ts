import zod from 'zod';
import { validateSchema, MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT, RECORD_CORRECTION_REASON, RecordCorrectionReason } from '@ukef/dtfs2-common';
import { TFM_SESSION_USER_SCHEMA } from '@ukef/dtfs2-common/schemas';

/**
 * Schema for validating record correction reasons are of type
 * {@link RecordCorrectionReason} using Zod enum.
 */
const RecordCorrectionReasonSchema = zod.enum(Object.values(RECORD_CORRECTION_REASON) as [RecordCorrectionReason, ...RecordCorrectionReason[]]);

/**
 * Schema for validating fee record correction request transient form data payload.
 * Includes user information and form data with reasons and additional info.
 */
const PutFeeRecordCorrectionRequestTransientFormDataPayloadSchema = zod.object({
  user: TFM_SESSION_USER_SCHEMA,
  formData: zod.object({
    reasons: zod.array(RecordCorrectionReasonSchema).min(1),
    additionalInfo: zod.string().min(1).max(MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT),
  }),
});

/**
 * Type definition for fee record correction request transient form data payload.
 */
export type PutFeeRecordCorrectionRequestTransientFormDataPayload = zod.infer<typeof PutFeeRecordCorrectionRequestTransientFormDataPayloadSchema>;

/**
 * Middleware function to validate fee record correction request transient form data payload.
 */
export const validatePutFeeRecordCorrectionRequestTransientFormDataPayload = validateSchema(PutFeeRecordCorrectionRequestTransientFormDataPayloadSchema);
