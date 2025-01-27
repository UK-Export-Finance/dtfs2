import { ApiError, CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { HttpStatusCode } from 'axios';
import { NotFoundError } from '../../../../../errors';
import { FeeRecordCorrectionRepo } from '../../../../../repositories/fee-record-correction-repo';
import { mapCompletedFeeRecordCorrectionsToResponse } from './helpers';

/**
 * Request type for the GET completed fee record corrections by bank id endpoint.
 */
export type GetCompletedFeeRecordCorrectionsRequest = CustomExpressRequest<{
  params: {
    bankId: string;
  };
}>;

/**
 * Response body type for the GET completed fee record corrections by bank id endpoint.
 */
export type GetCompletedFeeRecordCorrectionsResponseBody = {
  id: number;
  dateSent: Date;
  exporter: string;
  formattedReasons: string;
  formattedPreviousValues: string;
  formattedCorrectedValues: string;
  bankCommentary?: string;
}[];

/**
 * Response type for the GET completed fee record corrections by bank id endpoint.
 */
export type GetCompletedFeeRecordCorrectionsResponse = Response<GetCompletedFeeRecordCorrectionsResponseBody | string>;

/**
 * Controller for the GET completed fee record corrections by bank id route.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A promise that resolves to the response containing the completed fee record corrections for the bank.
 */
export const getCompletedFeeRecordCorrections = async (req: GetCompletedFeeRecordCorrectionsRequest, res: GetCompletedFeeRecordCorrectionsResponse) => {
  const { bankId } = req.params;

  try {
    const completedCorrections = await FeeRecordCorrectionRepo.findCompletedCorrectionsByBankIdWithFeeRecord(bankId);

    if (completedCorrections.length === 0) {
      throw new NotFoundError(`Failed to find any completed fee record corrections with bank id ${bankId}`);
    }

    const mappedCompletedCorrections = mapCompletedFeeRecordCorrectionsToResponse(completedCorrections);

    return res.status(HttpStatusCode.Ok).send(mappedCompletedCorrections);
  } catch (error) {
    const errorMessage = `Failed to get completed fee record corrections`;

    console.error('%s %o', errorMessage, error);

    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }

    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
