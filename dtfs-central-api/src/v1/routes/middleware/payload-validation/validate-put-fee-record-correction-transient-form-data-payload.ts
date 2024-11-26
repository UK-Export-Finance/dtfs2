import z from 'zod';
import { createValidationMiddlewareForSchema, RECORD_CORRECTION_REASON, RecordCorrectionReason } from '@ukef/dtfs2-common';
import { TfmSessionUserSchema } from './schemas';

const RecordCorrectionReasonSchema = z.enum(Object.values(RECORD_CORRECTION_REASON) as [RecordCorrectionReason, ...RecordCorrectionReason[]]);

const PutFeeRecordCorrectionTransientFormDataSchema = z.object({
  user: TfmSessionUserSchema,
  formData: z.object({
    reasons: z.array(RecordCorrectionReasonSchema).min(1),
    additionalInfo: z.string().min(1).max(500), // TODO FN-3577: Pull out 500 into constant in dtfs2-common? used in multiple services now
  }),
});

export type PutFeeRecordCorrectionTransientFormDataSchema = z.infer<typeof PutFeeRecordCorrectionTransientFormDataSchema>;

export const validatePutFeeRecordCorrectionTransientFormDataSchema = createValidationMiddlewareForSchema(PutFeeRecordCorrectionTransientFormDataSchema);
