import { ApiError, CustomExpressRequest, UtilisationReportRawCsvCellDataWithLocation } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { HttpStatusCode } from 'axios';
import { validateCsvData } from '../../../../services/utilisation-report-data-validator';

// QQ this should be exporting somewhere to be used for payload validation for the post upload route
// QQ do we really want to use the upload request body though....
// QQ the report data should be with keys of array of objects where the keys are the headers and then for each header
// QQ we have { value: string, column: string, row: number }
type PreReportDataValidationPostUploadUtilisationReportRequest = CustomExpressRequest<{
  reqBody: {
    reportData: Record<string, UtilisationReportRawCsvCellDataWithLocation>[];
  };
}>;

export const postValidateUtilisationReportData = (req: PreReportDataValidationPostUploadUtilisationReportRequest, res: Response) => {
  const { reportData } = req.body;

  try {
    const csvValidationErrors = validateCsvData(reportData);
    return res.status(HttpStatusCode.Ok).send({ csvValidationErrors });
  } catch (error) {
    // QQ check happy with this error handling
    const errorMessage = 'Failed to validate report data';
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
