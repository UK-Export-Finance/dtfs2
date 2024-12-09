import { Response } from 'express';
import { HttpStatusCode, isAxiosError } from 'axios';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { FeeRecordCorrectionRequestReviewResponseBody } from '../../../api-response-types';
import api from '../../../api';

export type GetFeeRecordCorrectionRequestReviewRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    feeRecordId: string;
    user: string;
  };
}>;

type GetFeeRecordCorrectionRequestReviewResponse = Response<FeeRecordCorrectionRequestReviewResponseBody | string>;

/**
 * Controller for the GET fee record correction request review route.
 * @param req - The request object
 * @param res - The response object
 * @returns The fee record correction request review
 */
export const getFeeRecordCorrectionRequestReview = async (
  req: GetFeeRecordCorrectionRequestReviewRequest,
  res: GetFeeRecordCorrectionRequestReviewResponse,
) => {
  const { reportId, feeRecordId, user } = req.params;

  try {
    const correctionRequestReview = await api.getFeeRecordCorrectionRequestReview(reportId, feeRecordId, user);

    return res.status(HttpStatusCode.Ok).send(correctionRequestReview);
  } catch (error) {
    const errorMessage = 'Failed to get fee record correction request review';
    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    console.error(errorMessage, error);
    return res.status(errorStatus).send(errorMessage);
  }
};
