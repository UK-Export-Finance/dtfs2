import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { HttpStatusCode, isAxiosError } from 'axios';
import api from '../../../../api';

/**
 * Request type for the GET fee record correction endpoint.
 */
export type GetFeeRecordCorrectionRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    feeRecordId: string;
    correctionId: string;
  };
}>;

/**
 * Calls the DTFS Central API to get a fee record correction.
 * @param req - The request object containing information about the HTTP request.
 * @param res - The response object used to send the HTTP response.
 */
// TODO FN-3668: Add unit tests.
// TODO FN-3668: In the call to this, want to call validateUserAndBankIdMatch validation middleware.
export const getFeeRecordCorrection = async (req: GetFeeRecordCorrectionRequest, res: Response) => {
  try {
    const { reportId, feeRecordId, correctionId } = req.params;

    // TODO FN-3668: Need to add validation to check that the bank can access the correction (check id of bank in the response against the users bank id).

    const feeRecordCorrection = await api.getFeeRecordCorrectionById(Number(correctionId), Number(reportId), Number(feeRecordId));

    return res.status(HttpStatusCode.Ok).send(feeRecordCorrection);
  } catch (error) {
    const errorMessage = 'Failed to get fee record correction';

    console.error(errorMessage, error);

    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;

    return res.status(errorStatus).send(errorMessage);
  }
};
