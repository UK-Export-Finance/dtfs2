import z from 'zod';
import { UtilisationReportCsvRowDataSchema } from './schemas';
import { createValidationMiddlewareForSchema } from './create-validation-middleware-for-schema';

const PostValidateUtilisationReportDataSchema = z.object({
  reportData: z.array(UtilisationReportCsvRowDataSchema),
});

export type PostValidateUtilisationReportDataPayload = z.infer<typeof PostValidateUtilisationReportDataSchema>;

/**
 * Validates the payload for the post validate utilisation report data route
 */
export const validatePostValidateUtilisationReportDataPayload = createValidationMiddlewareForSchema(PostValidateUtilisationReportDataSchema);
