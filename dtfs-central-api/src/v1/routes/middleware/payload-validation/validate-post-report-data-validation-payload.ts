import z from 'zod';
import { UtilisationReportCsvRowDataSchema } from './schemas';
import { createValidationMiddlewareForSchema } from './create-validation-middleware-for-schema';

const PostReportDataValidationSchema = z.object({
  reportData: z.array(UtilisationReportCsvRowDataSchema),
});

export type PostReportDataValidationPayload = z.infer<typeof PostReportDataValidationSchema>;

/**
 * Validates the payload for the post report data validation route
 */
export const validatePostReportDataValidationPayload = createValidationMiddlewareForSchema(PostReportDataValidationSchema);
