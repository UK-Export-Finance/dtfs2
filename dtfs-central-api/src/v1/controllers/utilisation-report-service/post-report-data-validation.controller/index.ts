import { ApiError, CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { HttpStatusCode } from 'axios';
import { validateUtilisationReportCsvData } from '../../../../services/utilisation-report-data-validator';
import { PostReportDataValidationPayload } from '../../../routes/middleware/payload-validation/validate-post-report-data-validation-payload';

export type PostReportDataValidationRequest = CustomExpressRequest<{
  reqBody: PostReportDataValidationPayload;
}>;

/**
 * Controller to handle post request to report data validation route
 * @param req - The request
 * @param res - The response
 */
export const postReportDataValidation = async (req: PostReportDataValidationRequest, res: Response) => {
  const { reportData } = req.body;

  try {
    const csvValidationErrors = await validateUtilisationReportCsvData(reportData);

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
