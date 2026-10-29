import zod from 'zod';
import { validateSchema } from '@ukef/dtfs2-common';
import { UtilisationReportCsvRowDataSchema } from './schemas';

const PostReportDataValidationSchema = zod.object({
  reportData: zod.array(UtilisationReportCsvRowDataSchema),
});

export type PostReportDataValidationPayload = zod.infer<typeof PostReportDataValidationSchema>;

/**
 * Validates the payload for the post report data validation route
 */
export const validatePostReportDataValidationPayload = validateSchema(PostReportDataValidationSchema);
