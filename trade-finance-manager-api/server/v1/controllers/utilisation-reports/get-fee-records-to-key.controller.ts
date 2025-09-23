import { HttpStatusCode, isAxiosError } from 'axios';
import { Request, Response } from 'express';
import api from '../../api';

/**
 * Fetches utilisation report with the fee to key
 * @param {import('express').Request<{ reportId: string }>} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const getFeeRecordsToKey = async (req: Request, res: Response) => {
  const { reportId } = req.params;

  try {
    const utilisationReportWithFeeRecordsToKey = await api.getUtilisationReportWithFeeRecordsToKey(reportId);

    return res.status(HttpStatusCode.Ok).send(utilisationReportWithFeeRecordsToKey);
  } catch (error) {
    const errorMessage = 'Failed to get fee records to key';
    console.error('%s %o', errorMessage, error);
    const statusCode = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    return res.status(statusCode).send(errorMessage);
  }
};
