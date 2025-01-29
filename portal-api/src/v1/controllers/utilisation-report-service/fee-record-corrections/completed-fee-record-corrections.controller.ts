import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { HttpStatusCode, isAxiosError } from 'axios';
import api from '../../../api';

/**
 * Request type for the GET completed fee record corrections endpoint.
 */
export type CompletedFeeRecordCorrectionsRequest = CustomExpressRequest<{
  params: {
    bankId: string;
  };
}>;

/**
 * Calls the DTFS Central API to get completed fee record corrections for a given bank id.
 * @param req - The request object containing information about the HTTP request.
 * @param res - The response object used to send the HTTP response.
 */
export const getCompletedFeeRecordCorrections = async (req: CompletedFeeRecordCorrectionsRequest, res: Response) => {
  try {
    const { bankId } = req.params;

    const completedCorrections = await api.getCompletedFeeRecordCorrections(Number(bankId));

    return res.status(HttpStatusCode.Ok).send(completedCorrections);
  } catch (error) {
    const errorMessage = 'Failed to get completed fee record corrections';

    console.error('%s %o', errorMessage, error);

    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;

    return res.status(errorStatus).send(errorMessage);
  }
};
