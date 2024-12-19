import z from 'zod';
import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { MongoObjectIdSchema } from './schemas';

/**
 * Schema for validating fee record correction transient form data payload.
 * All the form data fields are of type string and nullable because the
 * form validation itself is taking place in the controller.
 */
const PutFeeRecordCorrectionTransientFormDataPayload = z.object({
  user: z.object({ id: MongoObjectIdSchema }),
  formData: z.object({
    utilisation: z.string().nullable(),
    facilityId: z.string().nullable(),
    reportedCurrency: z.string().nullable(),
    reportedFee: z.string().nullable(),
    additionalComments: z.string().nullable(),
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
