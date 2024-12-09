import { isAxiosError, HttpStatusCode } from 'axios';
import { Response } from 'express';

import { TfmSessionUser } from '@ukef/dtfs2-common';
import api from '../../../api';
import { CustomExpressRequest } from '../../../../types/custom-express-request';

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

/**
 * Creates a new fee record correction
 * @param req - The request object
 * @param res - The response object
 */
export const postFeeRecordCorrection = async (req: PostFeeRecordCorrectionRequest, res: Response) => {
  try {
    const { reportId, feeRecordId } = req.params;
    const { user } = req.body;

    await api.createFeeRecordCorrection(reportId, feeRecordId, user);

    return res.sendStatus(HttpStatusCode.Ok);
  } catch (error) {
    const errorMessage = 'Failed to create fee record correction';
    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    console.error(errorMessage, error);
    return res.status(errorStatus).send(errorMessage);
  }
};
