import { ApiError, RecordCorrectionTransientFormData } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest } from '../../../../../types/custom-express-request';
import { NotFoundError } from '../../../../../errors';
import { FeeRecordCorrectionTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-transient-form-data-repo';
import { FeeRecordRepo } from '../../../../../repositories/fee-record-repo';

export type GetFeeRecordCorrectionTransientFormDataRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    feeRecordId: string;
    userId: string;
  };
}>;

export type GetFeeRecordCorrectionTransientFormDataResponse = Response<RecordCorrectionTransientFormData | Record<string, never> | string>;

/**
 * Controller for the GET fee record correction transient form data route
 * @param req - The request object
 * @param res - The response object
 */
export const getFeeRecordCorrectionTransientFormData = async (
  req: GetFeeRecordCorrectionTransientFormDataRequest,
  res: GetFeeRecordCorrectionTransientFormDataResponse,
) => {
  try {
    const { reportId, feeRecordId, userId } = req.params;

    const feeRecordExists = await FeeRecordRepo.existsByIdAndReportId(Number(feeRecordId), Number(reportId));

    if (!feeRecordExists) {
      throw new NotFoundError(`Failed to find a fee record with id '${feeRecordId}' attached to report with id '${reportId}'`);
    }

    const transientFormDataEntity = await FeeRecordCorrectionTransientFormDataRepo.findByUserIdAndFeeRecordId(userId, Number(feeRecordId));

    const formData = transientFormDataEntity?.formData || {};

    return res.status(HttpStatusCode.Ok).send(formData);
  } catch (error) {
    const errorMessage = `Failed to get fee record correction transient form data`;
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
