import z from 'zod';
import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { MongoObjectIdSchema } from './schemas';

/**
 * Schema for validating fee record correction transient form data payload.
 * All the form data fields are of type string and nullable because the
 * form validation itself is taking place in the controller.
 */
const PutFeeRecordCorrectionTransientFormDataPayload = z.object({
  user: z.object({ _id: MongoObjectIdSchema }),
  formData: z.object({
    utilisation: z.string().optional(),
    facilityId: z.string().optional(),
    reportedCurrency: z.string().optional(),
    reportedFee: z.string().optional(),
    additionalComments: z.string().optional(),
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
