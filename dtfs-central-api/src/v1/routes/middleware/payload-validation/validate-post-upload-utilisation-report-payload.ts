import { CustomExpressRequest, Unknown, UtilisationReportCsvRowData } from '@ukef/dtfs2-common';
import { NextFunction, Response } from 'express';
import { HttpStatusCode } from 'axios';
import z from 'zod';
import { validateFileInfo, validateReportId, validateReportUser } from '../../../validation/utilisation-report-service/utilisation-report-validator';
import { validateUtilisationReportCsvData } from '../../../../services/utilisation-report-data-validator';
import { PostUploadUtilisationReportRequestBody } from '../../../controllers/utilisation-report-service/post-upload-utilisation-report.controller';

export type PreValidationPostUploadUtilisationReportRequest = CustomExpressRequest<{
  reqBody: Unknown<PostUploadUtilisationReportRequestBody>;
}>;

/**
 * Validates the payload for the utilisation report upload request
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 */
export const validatePostUploadUtilisationReportPayload = (req: PreValidationPostUploadUtilisationReportRequest, res: Response, next: NextFunction) => {
  const { reportId, fileInfo, reportData, user } = req.body;

  const reportDataSchema = z.array(z.record(z.string(), z.string().nullable()));
  const { success, error, data } = reportDataSchema.safeParse(reportData);
  if (!success) {
    console.error('Report data not provided in valid format %s', error);
    return res.status(HttpStatusCode.BadRequest).send('Failed to save utilisation report - report data structure invalid');
  }

  const reportDataMapped = data.map((reportDataRow, rowIndex) => {
    return Object.keys(reportDataRow).reduce((rowData, key) => {
      // We add two to the index to get the row to account for zero-indexing and the header row
      return { ...rowData, [key]: { value: reportDataRow[key], row: rowIndex + 2 } };
    }, {} as UtilisationReportCsvRowData);
  });

  const validationErrors = [
    validateReportId(reportId),
    ...validateFileInfo(fileInfo),
    ...validateUtilisationReportCsvData(reportDataMapped).map(({ errorMessage, value, row }) => ({ errorMessage, value, row })),
    ...validateReportUser(user),
  ].filter(Boolean);

  if (validationErrors.length > 0) {
    console.error('Failed to save utilisation report - validation errors: %O', validationErrors);
    return res.status(HttpStatusCode.BadRequest).send(validationErrors);
  }

  return next();
};
