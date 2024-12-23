import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { HttpStatusCode, isAxiosError } from 'axios';
import api from '../../../../api';

/**
 * Request type for the GET fee record correction endpoint.
 */
export type GetFeeRecordCorrectionRequest = CustomExpressRequest<{
  params: {
    bankId: string;
    correctionId: string;
  };
}>;

/**
 * Calls the DTFS Central API to get a fee record correction.
 *
 * Ensures that bank of the report attached to the correction matches the bank
 * of the requesting user.
 * @param req - The request object containing information about the HTTP request.
 * @param res - The response object used to send the HTTP response.
 */
export const getFeeRecordCorrection = async (req: GetFeeRecordCorrectionRequest, res: Response) => {
  try {
    const { bankId: requestingUserBankId, correctionId } = req.params;

    const feeRecordCorrection = await api.getFeeRecordCorrectionById(Number(correctionId));

    const { bankId: correctionBankId } = feeRecordCorrection;

    if (correctionBankId !== requestingUserBankId) {
      console.error(
        "Failed to get fee record correction with id '%s' as the bank id '%s' does not match the requesting user's bank id '%s'",
        correctionId,
        correctionBankId,
        requestingUserBankId,
      );
      return res.status(HttpStatusCode.NotFound).send(`Failed to find a fee record correction with id '${correctionId}'`);
    }

    return res.status(HttpStatusCode.Ok).send(feeRecordCorrection);
  } catch (error) {
    const errorMessage = 'Failed to get fee record correction';

    console.error(errorMessage, error);

    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;

    return res.status(errorStatus).send(errorMessage);
  }
};
