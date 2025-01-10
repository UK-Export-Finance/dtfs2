import { ApiError, CustomExpressRequest, FeeRecordCorrectionReviewInformation } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { HttpStatusCode } from 'axios';
import { NotFoundError } from '../../../../../errors';
import { FeeRecordCorrectionRepo } from '../../../../../repositories/fee-record-correction-repo';
import { mapTransientCorrectionDataToReviewInformation } from './helpers';
import { FeeRecordCorrectionTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-transient-form-data-repo';

export type GetFeeRecordCorrectionReviewRequest = CustomExpressRequest<{
  params: {
    correctionId: string;
    userId: string;
  };
}>;

export type GetFeeRecordCorrectionReviewResponse = Response<FeeRecordCorrectionReviewInformation | string>;

/**
 * Controller for the GET fee record correction review route.
 *
 * Fetches the transient form data for the bank user and correction id along
 * with the other information about the correction request and fee record
 * being corrected for the requesting user to review before sending their
 * correction response.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A promise that resolves to the response containing the fee record correction review information.
 */
export const getFeeRecordCorrectionReview = async (req: GetFeeRecordCorrectionReviewRequest, res: GetFeeRecordCorrectionReviewResponse) => {
  const { correctionId: correctionIdString, userId } = req.params;

  try {
    const correctionId = Number(correctionIdString);

    const feeRecordCorrection = await FeeRecordCorrectionRepo.findOneByIdWithFeeRecord(correctionId);

    if (!feeRecordCorrection) {
      throw new NotFoundError(`Failed to find fee record correction with id: ${correctionId}`);
    }

    const transientFormData = await FeeRecordCorrectionTransientFormDataRepo.findByUserIdAndCorrectionId(userId, correctionId);

    if (!transientFormData) {
      throw new NotFoundError(`Failed to find fee record correction transient form data with correction id ${correctionId} and user id ${userId}`);
    }

    const { formData } = transientFormData;

    const reviewInformation = mapTransientCorrectionDataToReviewInformation(formData, feeRecordCorrection);

    return res.status(HttpStatusCode.Ok).send(reviewInformation);
  } catch (error) {
    const errorMessage = `Failed to get fee record correction review information`;
    console.error('%s %o', errorMessage, error);

    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }

    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
