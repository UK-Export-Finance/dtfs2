import { ApiError, RecordCorrectionTransientFormData } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest } from '../../../../../types/custom-express-request';
import { FeeRecordCorrectionTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-transient-form-data-repo';

export type GetFeeRecordCorrectionTransientFormDataRequest = CustomExpressRequest<{
  params: {
    correctionId: string;
    userId: string;
  };
}>;

export type GetFeeRecordCorrectionTransientFormDataResponse = Response<RecordCorrectionTransientFormData | Record<string, never> | string>;

/**
 * Controller for the GET fee record correction transient form data route.
 * Retrieves the fee record correction transient form data entity with the
 * correction id and user id.
 * If form data doesn't exist, returns an empty object.
 * @param req - The request object
 * @param res - The response object
 */
export const getFeeRecordCorrectionTransientFormData = async (
  req: GetFeeRecordCorrectionTransientFormDataRequest,
  res: GetFeeRecordCorrectionTransientFormDataResponse,
) => {
  try {
    const { correctionId, userId } = req.params;

    const transientFormDataEntity = await FeeRecordCorrectionTransientFormDataRepo.findByUserIdAndCorrectionId(userId, Number(correctionId));

    const formData = transientFormDataEntity?.formData || {};

    return res.status(HttpStatusCode.Ok).send(formData);
  } catch (error) {
    const errorMessage = `Failed to get fee record correction transient form data`;
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
