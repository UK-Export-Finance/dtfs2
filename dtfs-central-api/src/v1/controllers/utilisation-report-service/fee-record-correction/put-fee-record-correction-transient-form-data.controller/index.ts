import { ApiError, FeeRecordCorrectionTransientFormDataEntity, REQUEST_PLATFORM_TYPE } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest } from '../../../../../types/custom-express-request';
import { PutFeeRecordCorrectionTransientFormDataSchema } from '../../../../routes/middleware/payload-validation';
import { FeeRecordCorrectionTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-transient-form-data-repo';

export type PutFeeRecordCorrectionTransientFormDataRequest = CustomExpressRequest<{
  params: {
    feeRecordId: string;
  };
  reqBody: PutFeeRecordCorrectionTransientFormDataSchema;
}>;

/**
 * Controller for the PUT fee record correction transient form data route
 * @param req - The request object
 * @param res - The response object
 */
export const putFeeRecordCorrectionTransientFormData = async (req: PutFeeRecordCorrectionTransientFormDataRequest, res: Response) => {
  try {
    const { feeRecordId } = req.params;
    const { user, formData } = req.body;
    const userId = user._id.toString();

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
