import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { HttpStatusCode, isAxiosError } from 'axios';
import api from '../../../api';

/**
 * Request type for the GET fee record correction review information endpoint.
 */
export type GetFeeRecordCorrectionReviewRequest = CustomExpressRequest<{
  params: {
    bankId: string;
    correctionId: string;
    userId: string;
  };
}>;

/**
 * Calls the DTFS Central API to get fee record correction review information.
 *
 * @param req - The request object containing information about the HTTP request.
 * @param res - The response object used to send the HTTP response.
 */
export const getFeeRecordCorrectionReview = async (req: GetFeeRecordCorrectionReviewRequest, res: Response) => {
  try {
    const { correctionId, userId } = req.params;

    const feeRecordCorrection = await api.getFeeRecordCorrectionReview(Number(correctionId), userId);

    return res.status(HttpStatusCode.Ok).send(feeRecordCorrection);
  } catch (error) {
    const errorMessage = 'Failed to get fee record correction review';

    console.error('%s %o', errorMessage, error);

    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;

    return res.status(errorStatus).send(errorMessage);
  }
};
