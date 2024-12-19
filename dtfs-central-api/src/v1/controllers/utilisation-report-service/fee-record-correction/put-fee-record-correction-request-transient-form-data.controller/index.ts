import { ApiError, FeeRecordCorrectionRequestTransientFormDataEntity, REQUEST_PLATFORM_TYPE } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest } from '../../../../../types/custom-express-request';
import { PutFeeRecordCorrectionRequestTransientFormDataPayload } from '../../../../routes/middleware/payload-validation';
import { FeeRecordCorrectionRequestTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-request-transient-form-data-repo';
import { FeeRecordRepo } from '../../../../../repositories/fee-record-repo';
import { NotFoundError } from '../../../../../errors';

export type PutFeeRecordCorrectionRequestTransientFormDataRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    feeRecordId: string;
  };
  reqBody: PutFeeRecordCorrectionRequestTransientFormDataPayload;
}>;

/**
 * Controller for the PUT fee record correction request transient form data route.
 * Validates the fee record exists, then creates a new fee record correction
 * transient form data entity with the fee record id, user id and form data,
 * and saves it.
 * @param req - The {@link PutFeeRecordCorrectionRequestTransientFormDataRequest} request object
 * @param res - The response object
 */
export const putFeeRecordCorrectionRequestTransientFormData = async (req: PutFeeRecordCorrectionRequestTransientFormDataRequest, res: Response) => {
  try {
    const { reportId, feeRecordId } = req.params;
    const { user, formData } = req.body;
    const userId = user._id.toString();

    const feeRecordExists = await FeeRecordRepo.existsByIdAndReportId(Number(feeRecordId), Number(reportId));

    if (!feeRecordExists) {
      throw new NotFoundError(`Failed to find a fee record with id '${feeRecordId}' attached to report with id '${reportId}'`);
    }

    const newTransientFormData = FeeRecordCorrectionRequestTransientFormDataEntity.create({
      userId,
      feeRecordId: Number(feeRecordId),
      formData,
      requestSource: {
        platform: REQUEST_PLATFORM_TYPE.TFM,
        userId,
      },
    });

    await FeeRecordCorrectionRequestTransientFormDataRepo.save(newTransientFormData);

    return res.sendStatus(HttpStatusCode.Ok);
  } catch (error) {
    const errorMessage = `Failed to put fee record correction request transient form data`;
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
