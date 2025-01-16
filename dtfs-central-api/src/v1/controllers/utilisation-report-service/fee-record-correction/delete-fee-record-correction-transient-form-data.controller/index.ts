import { ApiError } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest } from '../../../../../types/custom-express-request';
import { FeeRecordCorrectionTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-transient-form-data-repo';

export type DeleteFeeRecordCorrectionTransientFormDataRequest = CustomExpressRequest<{
  params: {
    correctionId: string;
    userId: string;
  };
}>;

/**
 * Controller for the DELETE fee record correction transient form data route.
 *
 * Deletes a fee record correction transient form data entity with the provided
 * correction id and user id.
 * @param req - The request object
 * @param res - The response object
 * @returns A '{@link HttpStatusCode.NoContent}' if there are no errors, even
 * if transient form data doesn't exist.
 */
export const deleteFeeRecordCorrectionTransientFormData = async (req: DeleteFeeRecordCorrectionTransientFormDataRequest, res: Response) => {
  try {
    const { correctionId, userId } = req.params;

    await FeeRecordCorrectionTransientFormDataRepo.deleteByUserIdAndCorrectionId(userId, Number(correctionId));

    return res.sendStatus(HttpStatusCode.NoContent);
  } catch (error) {
    const errorMessage = 'Failed to delete fee record correction transient form data';
    console.error('%s %o', errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
