import { CustomExpressRequest, UtilisationReportRawCsvCellDataWithLocation } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { HttpStatusCode, isAxiosError } from 'axios';
import api from '../../api';

export type ValidateUtilisationReportDataRequestBody = {
  reportData: Record<string, UtilisationReportRawCsvCellDataWithLocation>[];
};

type ValidateUtilisationReportDataRequest = CustomExpressRequest<{
  reqBody: ValidateUtilisationReportDataRequestBody;
}>;

/**
 * Calls the DTFS Central API to get a validation errors for utilisation report data
 * @param req - The request object containing information about the HTTP request.
 * @param res - The response object used to send the HTTP response.
 * @returns An object containing the validations errors for the utilisation report data
 */
export const validateUtilisationReportData = async (req: ValidateUtilisationReportDataRequest, res: Response) => {
  try {
    const { reportData } = req.body;
    const validationErrors = await api.validateUtilisationReportData(reportData);
    return res.status(200).send(validationErrors);
  } catch (error) {
    const errorMessage = 'Failed to validate utilisation report data';
    console.error(errorMessage, error);
    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    return res.status(errorStatus).send(errorMessage);
  }
};
