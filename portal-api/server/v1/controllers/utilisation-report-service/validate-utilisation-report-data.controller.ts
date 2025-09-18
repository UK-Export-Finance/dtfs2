import { CustomExpressRequest, UtilisationReportCsvCellData } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { HttpStatusCode, isAxiosError } from 'axios';
import api from '../../api';

export type ValidateUtilisationReportDataRequestBody = {
  reportData: Record<string, UtilisationReportCsvCellData>[];
};

type ValidateUtilisationReportDataRequest = CustomExpressRequest<{
  reqBody: ValidateUtilisationReportDataRequestBody;
}>;

/**
 * Calls the DTFS Central API to get a validation errors for utilisation report data
 * @param req - The request object containing information about the HTTP request.
 * @param res - The response object used to send the HTTP response.
 */
export const validateUtilisationReportData = async (req: ValidateUtilisationReportDataRequest, res: Response) => {
  try {
    const { reportData } = req.body;

    const validationErrors = await api.validateUtilisationReportData(reportData);

    return res.status(HttpStatusCode.Ok).send(validationErrors);
  } catch (error) {
    const errorMessage = 'Failed to validate utilisation report data';

    console.error('%s %o', errorMessage, error);

    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;

    return res.status(errorStatus).send(errorMessage);
  }
};
