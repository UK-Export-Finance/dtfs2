import { ApiError, FeeRecordCorrectionTransientFormDataEntity, REQUEST_PLATFORM_TYPE } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest } from '../../../../../types/custom-express-request';
import { PutFeeRecordCorrectionTransientFormDataPayload } from '../../../../routes/middleware/payload-validation';
import { FeeRecordCorrectionTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-transient-form-data-repo';
import { FeeRecordRepo } from '../../../../../repositories/fee-record-repo';
import { NotFoundError } from '../../../../../errors';

export type PutFeeRecordCorrectionTransientFormDataRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    feeRecordId: string;
  };
  reqBody: PutFeeRecordCorrectionTransientFormDataPayload;
}>;

/**
 * Controller for the PUT fee record correction transient form data route.
 * Validates the fee record exists, then creates a new fee record correction
 * transient form data entity with the fee record id, user id and form data,
 * and saves it.
 * @param req - The {@link PutFeeRecordCorrectionTransientFormDataRequest} request object
 * @param res - The response object
 */
export const putFeeRecordCorrectionTransientFormData = async (req: PutFeeRecordCorrectionTransientFormDataRequest, res: Response) => {
  try {
    const { reportId, feeRecordId } = req.params;
    const { user, formData } = req.body;
    const userId = user._id.toString();

    const feeRecordExists = await FeeRecordRepo.existsByIdAndReportId(Number(feeRecordId), Number(reportId));

    if (!feeRecordExists) {
      throw new NotFoundError(`Failed to find a fee record with id '${feeRecordId}' attached to report with id '${reportId}'`);
    }

    const newTransientFormData = FeeRecordCorrectionTransientFormDataEntity.create({
      userId,
      feeRecordId: Number(feeRecordId),
      formData,
      requestSource: {
        platform: REQUEST_PLATFORM_TYPE.TFM,
        userId,
      },
    });

    await FeeRecordCorrectionTransientFormDataRepo.save(newTransientFormData);

    return res.sendStatus(HttpStatusCode.Ok);
  } catch (error) {
    const errorMessage = `Failed to put fee record correction transient form data`;
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
