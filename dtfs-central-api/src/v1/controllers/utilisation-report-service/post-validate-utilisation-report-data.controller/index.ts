import { ApiError, CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { HttpStatusCode } from 'axios';
import { validateCsvData } from '../../../../services/utilisation-report-data-validator';
import { PostValidateUtilisationReportDataPayload } from '../../../routes/middleware/payload-validation/validate-post-validate-utilisation-report-data-payload';

type PostValidateUtilisationReportDataRequest = CustomExpressRequest<{
  reqBody: PostValidateUtilisationReportDataPayload;
}>;

export const postValidateUtilisationReportData = (req: PostValidateUtilisationReportDataRequest, res: Response) => {
  const { reportData } = req.body;

  try {
    const csvValidationErrors = validateCsvData(reportData);
    return res.status(HttpStatusCode.Ok).send({ csvValidationErrors });
  } catch (error) {
    const errorMessage = 'Failed to validate report data';
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
