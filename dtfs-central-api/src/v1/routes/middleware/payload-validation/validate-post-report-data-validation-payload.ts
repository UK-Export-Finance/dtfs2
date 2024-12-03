import z from 'zod';
import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { UtilisationReportCsvRowDataSchema } from './schemas';

const PostReportDataValidationSchema = z.object({
  reportData: z.array(UtilisationReportCsvRowDataSchema),
});

export type PostReportDataValidationPayload = z.infer<typeof PostReportDataValidationSchema>;

/**
 * Validates the payload for the post report data validation route
 */
export const validatePostReportDataValidationPayload = createValidationMiddlewareForSchema(PostReportDataValidationSchema);
