import { Request, Response } from 'express';
import { HttpStatusCode, isAxiosError } from 'axios';
import api from '../../api';

/**
 * Fetches a list of utilisation reports reconciliation progress for specified year and bank.
 */
export const getUtilisationReportSummariesByBankAndYear = async (req: Request<{ bankId: string; year: string }>, res: Response) => {
  const { bankId, year } = req.params;
  try {
    const summary = await api.getUtilisationReportSummariesByBankIdAndYear(bankId, year);
    res.status(200).send(summary);
  } catch (error) {
    const errorMessage = `Failed to get previous utilisation reports by bank id ${bankId} and year ${year}`;
    console.error(errorMessage, error);
    const statusCode = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    res.status(statusCode).send(errorMessage);
  }
};
