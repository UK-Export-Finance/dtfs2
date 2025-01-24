import { Response } from 'express';
import { HttpStatusCode, isAxiosError } from 'axios';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import api from '../../../api';

export type GetUtilisationReportPendingCorrectionsRequest = CustomExpressRequest<{
  params: {
    bankId: string;
  };
}>;

/**
 * Controller for the GET utilisation report pending corrections route.
 *
 * Returns pending corrections if any exist, otherwise returns an empty object.
 * @param req - The request object
 * @param res - The response object
 */
export const getUtilisationReportPendingCorrectionsByBankId = async (req: GetUtilisationReportPendingCorrectionsRequest, res: Response) => {
  try {
    const { bankId } = req.params;

    const pendingCorrections = await api.getUtilisationReportPendingCorrectionsByBankId(bankId);

    return res.status(HttpStatusCode.Ok).send(pendingCorrections);
  } catch (error) {
    const errorMessage = 'Failed to get pending corrections';
    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;

    console.error(errorMessage, error);
    return res.status(errorStatus).send(errorMessage);
  }
};
