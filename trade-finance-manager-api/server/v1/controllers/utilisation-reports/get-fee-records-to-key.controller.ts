import { HttpStatusCode, isAxiosError } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import api from '../../api';

export type GetFeeRecordsToKeyRequest = CustomExpressRequest<{ params: { reportId: string } }>;

/**
 * Fetches utilisation report with the fee records to key
 * @param {import('express').Request<{ reportId: string }>} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const getFeeRecordsToKey = async (req: GetFeeRecordsToKeyRequest, res: Response) => {
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
