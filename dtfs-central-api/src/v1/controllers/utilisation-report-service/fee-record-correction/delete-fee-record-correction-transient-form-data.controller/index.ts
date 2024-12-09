import { ApiError } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest } from '../../../../../types/custom-express-request';
import { FeeRecordCorrectionTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-transient-form-data-repo';

export type DeleteFeeRecordCorrectionTransientFormDataRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    feeRecordId: string;
    userId: string;
  };
}>;

// TODO FN-3690: Need to add tests for this controller.
/**
 * Controller for the DELETE fee record correction transient form data route.
 * Deletes a fee record correction transient form data entity with the provided
 * fee record id and user id.
 * Returns {@link HttpStatusCode.NoContent} if there are no errors, even if
 * transient form data doesn't exist.
 * @param req - The request object
 * @param res - The response object
 */
export const deleteFeeRecordCorrectionTransientFormData = async (req: DeleteFeeRecordCorrectionTransientFormDataRequest, res: Response) => {
  try {
    const { feeRecordId, userId } = req.params;

    await FeeRecordCorrectionTransientFormDataRepo.deleteByUserIdAndFeeRecordId(userId, Number(feeRecordId));

    return res.sendStatus(HttpStatusCode.NoContent);
  } catch (error) {
    const errorMessage = 'Failed to delete fee record correction transient form data';
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
