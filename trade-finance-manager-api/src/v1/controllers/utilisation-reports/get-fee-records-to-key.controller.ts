import { HttpStatusCode, isAxiosError } from 'axios';
import { Request, Response } from 'express';
import api from '../../api';

export const getFeeRecordsToKey = async (req: Request, res: Response) => {
  const { reportId } = req.params;

  try {
    const utilisationReportWithFeeRecordsToKey = await api.getUtilisationReportWithFeeRecordsToKey(reportId);

    return res.status(HttpStatusCode.Ok).send(utilisationReportWithFeeRecordsToKey);
  } catch (error) {
    const errorMessage = 'Failed to get fee records to key';
    console.error(errorMessage, error);
    const statusCode = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    return res.status(statusCode).send(errorMessage);
  }
};
