import { ApiError, FeeRecordCorrectionTransientFormDataEntity, RecordCorrectionTransientFormData, REQUEST_PLATFORM_TYPE } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest } from '../../../../../types/custom-express-request';
import { NotFoundError } from '../../../../../errors';
import { FeeRecordCorrectionRepo } from '../../../../../repositories/fee-record-correction-repo';
import { FeeRecordCorrectionTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-transient-form-data-repo';
import { PutFeeRecordCorrectionTransientFormDataPayload } from '../../../../routes/middleware/payload-validation';

export type PutFeeRecordCorrectionTransientFormDataRequest = CustomExpressRequest<{
  params: {
    bankId: string;
    correctionId: string;
  };
  reqBody: PutFeeRecordCorrectionTransientFormDataPayload;
}>;

/**
 * Controller for the PUT fee record correction transient form data route.
 *
 * Validates the correction exists and belongs to a report for the correct bank.
 *
 * Then creates a new fee record correction transient form data entity with the
 * correction id, user id and form data, and saves it.
 * @param req - The {@link PutFeeRecordCorrectionTransientFormDataRequest} request object
 * @param res - The response object
 */
export const putFeeRecordCorrectionTransientFormData = async (req: PutFeeRecordCorrectionTransientFormDataRequest, res: Response) => {
  try {
    const { correctionId: correctionIdString, bankId } = req.params;
    const { user, formData } = req.body;

    const correctionId = Number(correctionIdString);
    const userId = user.id;

    const correction = await FeeRecordCorrectionRepo.findByIdAndBankId(correctionId, bankId);

    if (!correction) {
      throw new NotFoundError(`Failed to find a correction with id '${correctionId}' for bank id '${bankId}'`);
    }

    // TODO: FN-3688 - validate the form data has the fields expected for the given reasons
    const validatedFormData = formData as unknown as RecordCorrectionTransientFormData;

    const newTransientFormData = FeeRecordCorrectionTransientFormDataEntity.create({
      userId,
      correctionId,
      formData: validatedFormData,
      requestSource: {
        platform: REQUEST_PLATFORM_TYPE.PORTAL,
        userId,
      },
    });

    await FeeRecordCorrectionTransientFormDataRepo.save(newTransientFormData);

    return res.sendStatus(HttpStatusCode.Ok);
  } catch (error) {
    const errorMessage = 'Failed to put fee record correction transient form data';
    console.error('%s %o', errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
