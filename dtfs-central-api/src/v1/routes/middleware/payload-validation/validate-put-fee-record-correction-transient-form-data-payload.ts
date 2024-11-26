import z from 'zod';
import {
  createValidationMiddlewareForSchema,
  MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT,
  RECORD_CORRECTION_REASON,
  RecordCorrectionReason,
} from '@ukef/dtfs2-common';
import { TfmSessionUserSchema } from './schemas';

const RecordCorrectionReasonSchema = z.enum(Object.values(RECORD_CORRECTION_REASON) as [RecordCorrectionReason, ...RecordCorrectionReason[]]);

const PutFeeRecordCorrectionTransientFormDataSchema = z.object({
  user: TfmSessionUserSchema,
  formData: z.object({
    reasons: z.array(RecordCorrectionReasonSchema).min(1),
    additionalInfo: z.string().min(1).max(MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT),
  }),
});

export type PutFeeRecordCorrectionTransientFormDataSchema = z.infer<typeof PutFeeRecordCorrectionTransientFormDataSchema>;

export const validatePutFeeRecordCorrectionTransientFormDataSchema = createValidationMiddlewareForSchema(PutFeeRecordCorrectionTransientFormDataSchema);
