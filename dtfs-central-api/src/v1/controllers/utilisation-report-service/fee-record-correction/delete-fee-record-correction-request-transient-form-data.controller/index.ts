import { ApiError } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest } from '../../../../../types/custom-express-request';
import { FeeRecordCorrectionRequestTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-request-transient-form-data-repo';
import { NotFoundError } from '../../../../../errors';
import { FeeRecordRepo } from '../../../../../repositories/fee-record-repo';

export type DeleteFeeRecordCorrectionRequestTransientFormDataRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    feeRecordId: string;
    userId: string;
  };
}>;

/**
 * Controller for the DELETE fee record correction request transient form data route.
 *
 * Deletes a fee record correction request transient form data entity with the provided
 * fee record id and user id. Checks for existence of the associated fee record
 * entity before deletion and throws NotFoundError if it does not exist.
 * @param req - The request object
 * @param res - The response object
 * @returns A '{@link HttpStatusCode.NoContent}' if there are no errors, even
 * if transient form data doesn't exist.
 */
export const deleteFeeRecordCorrectionRequestTransientFormData = async (req: DeleteFeeRecordCorrectionRequestTransientFormDataRequest, res: Response) => {
  try {
    const { reportId, feeRecordId, userId } = req.params;

    const feeRecordExists = await FeeRecordRepo.existsByIdAndReportId(Number(feeRecordId), Number(reportId));

    if (!feeRecordExists) {
      throw new NotFoundError(`Failed to find a fee record with id '${feeRecordId}' attached to report with id '${reportId}'`);
    }

    await FeeRecordCorrectionRequestTransientFormDataRepo.deleteByUserIdAndFeeRecordId(userId, Number(feeRecordId));

    return res.sendStatus(HttpStatusCode.NoContent);
  } catch (error) {
    const errorMessage = 'Failed to delete fee record correction request transient form data';
    console.error('%s %o', errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
