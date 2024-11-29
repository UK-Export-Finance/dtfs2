import { ApiError } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest } from '../../../../../types/custom-express-request';
import { NotFoundError } from '../../../../../errors';
import { FeeRecordCorrectionTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-transient-form-data-repo';

export type GetFeeRecordCorrectionTransientFormDataRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    feeRecordId: string;
    userId: string;
  };
}>;

/**
 * Controller for the GET fee record correction transient form data route
 * @param req - The request object
 * @param res - The response object
 */
export const getFeeRecordCorrectionTransientFormData = async (req: GetFeeRecordCorrectionTransientFormDataRequest, res: Response) => {
  try {
    const { feeRecordId, userId } = req.params;

    const transientFormData = await FeeRecordCorrectionTransientFormDataRepo.findByUserIdAndFeeRecordId(userId, Number(feeRecordId));

    if (!transientFormData) {
      throw new NotFoundError(`Failed to find a fee record correction transient form data with fee record ID '${feeRecordId}' and user with id '${userId}'`);
    }

    return res.status(HttpStatusCode.Ok).send(transientFormData.formData);
  } catch (error) {
    const errorMessage = `Failed to get fee record correction transient form data`;
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
