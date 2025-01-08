import { ApiError, CustomExpressRequest, FeeRecordCorrectionReviewInformation } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { HttpStatusCode } from 'axios';
import { NotFoundError } from '../../../../../errors';
import { FeeRecordCorrectionRepo } from '../../../../../repositories/fee-record-correction-repo';
import { mapToReviewInformation } from './helpers';

export type GetFeeRecordCorrectionReviewRequest = CustomExpressRequest<{
  params: {
    correctionId: string;
    userId: string;
  };
}>;

type GetFeeRecordCorrectionReviewResponse = Response<FeeRecordCorrectionReviewInformation | string>;

// TODO: Add unit tests
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

    // TODO: Find correction transient form data once persistence work completed (TODO: MERGE IN). Throw NotFoundError if not present for correctionId and userId.
    const transientFormData = {
      feeRecordId: 7,
      formData: {
        utilisation: 80,
        facilityId: '12345678',
        additionalInfo: 'some bank commentary',
      },
    };

    if (!transientFormData) {
      throw new NotFoundError(`Failed to find fee record correction transient form data with correction id ${correctionId} and user id ${userId}`);
    }

    // TODO: Do we need the report, can we add a new reduced repo method?
    const feeRecordCorrection = await FeeRecordCorrectionRepo.findOneByIdWithFeeRecordAndReport(correctionId);

    if (!feeRecordCorrection) {
      throw new NotFoundError(`Failed to find fee record correction with id: ${correctionId}`);
    }

    const { formData } = transientFormData;

    const reviewInformation = mapToReviewInformation(formData, feeRecordCorrection);

    return res.status(HttpStatusCode.Ok).send(reviewInformation);
  } catch (error) {
    const errorMessage = `Failed to get fee record correction review information`;
    console.error(errorMessage, error);

    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }

    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
