import zod from 'zod';
import { validateSchema } from '@ukef/dtfs2-common';
import { MongoObjectIdSchema } from './schemas';

/**
 * Schema for validating fee record correction transient form data payload.
 * All the form data fields are of type string and nullable because the
 * form validation itself is taking place in the controller.
 */
const PutFeeRecordCorrectionTransientFormDataPayloadSchema = zod.object({
  user: zod.object({ _id: MongoObjectIdSchema }),
  formData: zod.object({
    utilisation: zod.string().optional(),
    facilityId: zod.string().optional(),
    reportedCurrency: zod.string().optional(),
    reportedFee: zod.string().optional(),
    additionalComments: zod.string().optional(),
  }),
});

/**
 * Type definition for fee record correction transient form data payload.
 */
export type PutFeeRecordCorrectionTransientFormDataPayload = zod.infer<typeof PutFeeRecordCorrectionTransientFormDataPayloadSchema>;

/**
 * Middleware function to validate fee record correction transient form data payload.
 */
export const validatePutFeeRecordCorrectionTransientFormDataPayload = validateSchema(PutFeeRecordCorrectionTransientFormDataPayloadSchema);
