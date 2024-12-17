import { ApiError, CurrencyAndAmount, RecordCorrectionReason } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest } from '../../../../../types/custom-express-request';
import { NotFoundError } from '../../../../../errors';
import { FeeRecordCorrectionRepo } from '../../../../../repositories/fee-record-correction-repo';
import { mapFeeRecordCorrectionEntityToResponse } from './helpers';

/**
 * Request type for the GET fee record correction endpoint.
 */
export type GetFeeRecordCorrectionRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    feeRecordId: string;
    correctionId: string;
  };
}>;

/**
 * Response body type for the GET fee record correction endpoint.
 */
export type GetFeeRecordCorrectionBody = {
  id: number;
  facilityId: string;
  exporter: string;
  reportedFees: CurrencyAndAmount;
  reasons: RecordCorrectionReason[];
  additionalInfo: string;
};

type GetFeeRecordCorrection = Response<GetFeeRecordCorrectionBody | string>;

/**
 * Controller for the GET fee record correction endpoint
 * @param req - The request object
 * @param res - The response object
 * @returns The response object with a response status code and body
 */
// TODO FN-3668: Add unit tests.
// TODO FN-3668: Add API tests?
export const getFeeRecordCorrection = async (req: GetFeeRecordCorrectionRequest, res: GetFeeRecordCorrection) => {
  const { reportId, feeRecordId, correctionId: correctionIdString } = req.params;

  try {
    const correctionId = Number(correctionIdString);

    const feeRecordCorrectionEntity = await FeeRecordCorrectionRepo.findOneByIdAndReportIdAndFeeRecordIdWithFeeRecord(
      correctionId,
      Number(feeRecordId),
      Number(reportId),
    );

    if (!feeRecordCorrectionEntity) {
      throw new NotFoundError(
        `Failed to find a fee record correction with id '${correctionId}' with an attached fee record with id '${feeRecordId}' attached to report with id '${reportId}'`,
      );
    }

    const feeRecordCorrectionDetails = mapFeeRecordCorrectionEntityToResponse(feeRecordCorrectionEntity);

    return res.status(HttpStatusCode.Ok).send(feeRecordCorrectionDetails);
  } catch (error) {
    const errorMessage = 'Failed to get record correction';
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
