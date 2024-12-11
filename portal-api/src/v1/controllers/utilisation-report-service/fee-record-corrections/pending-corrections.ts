import { Request, Response } from 'express';
import { HttpStatusCode, isAxiosError } from 'axios';
import api from '../../../api';

export const getUtilisationReportPendingCorrectionsByBankId = async (req: Request, res: Response) => {
  try {
    const { bankId } = req.params;

    const pendingCorrections = await api.getUtilisationReportPendingCorrectionsByBankId(bankId);

    return res.status(200).send(pendingCorrections);
  } catch (error) {
    const errorMessage = 'Failed to get pending corrections';
    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;

    console.error(errorMessage, error);
    return res.status(errorStatus).send(errorMessage);
  }
};
