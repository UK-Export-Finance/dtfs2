import { isAxiosError, HttpStatusCode } from 'axios';
import { Response } from 'express';

import api from '../../../api';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { TfmSessionUser } from '../../../../types/tfm-session-user';
import { FeeRecordCorrectionResponseBody } from '../../../api-response-types';

export type PostFeeRecordCorrectionRequestBody = {
  user: TfmSessionUser;
};

export type PostFeeRecordCorrectionRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    feeRecordId: string;
  };
  reqBody: PostFeeRecordCorrectionRequestBody;
}>;

type PostFeeRecordCorrectionResponse = Response<FeeRecordCorrectionResponseBody | string>;

/**
 * Creates a new fee record correction
 * @param req - The request object
 * @param res - The response object
 */
export const postFeeRecordCorrection = async (req: PostFeeRecordCorrectionRequest, res: PostFeeRecordCorrectionResponse) => {
  try {
    const { reportId, feeRecordId } = req.params;
    const { user } = req.body;

    const responseBody = await api.createFeeRecordCorrection(reportId, feeRecordId, user);

    return res.status(HttpStatusCode.Ok).send(responseBody);
  } catch (error) {
    const errorMessage = 'Failed to create fee record correction';
    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    console.error(errorMessage, error);
    return res.status(errorStatus).send(errorMessage);
  }
};
