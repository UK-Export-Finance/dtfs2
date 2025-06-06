import { CustomExpressRequest, ApiError, RecordCorrectionRequestTransientFormData } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { NotFoundError } from '../../../../../errors';
import { FeeRecordCorrectionRequestTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-request-transient-form-data-repo';
import { FeeRecordRepo } from '../../../../../repositories/fee-record-repo';

export type GetFeeRecordCorrectionRequestTransientFormDataRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    feeRecordId: string;
    userId: string;
  };
}>;

export type GetFeeRecordCorrectionRequestTransientFormDataResponse = Response<RecordCorrectionRequestTransientFormData | Record<string, never> | string>;

/**
 * Controller for the GET fee record correction request transient form data route.
 * Validates the fee record exists, then retrieves the fee record correction
 * transient form data entity with the fee record id and user id.
 * If form data doesn't exist, returns an empty object.
 * @param req - The request object
 * @param res - The response object
 */
export const getFeeRecordCorrectionRequestTransientFormData = async (
  req: GetFeeRecordCorrectionRequestTransientFormDataRequest,
  res: GetFeeRecordCorrectionRequestTransientFormDataResponse,
) => {
  try {
    const { reportId, feeRecordId, userId } = req.params;

    const feeRecordExists = await FeeRecordRepo.existsByIdAndReportId(Number(feeRecordId), Number(reportId));

    if (!feeRecordExists) {
      throw new NotFoundError(`Failed to find a fee record with id '${feeRecordId}' attached to report with id '${reportId}'`);
    }

    const transientFormDataEntity = await FeeRecordCorrectionRequestTransientFormDataRepo.findByUserIdAndFeeRecordId(userId, Number(feeRecordId));

    const formData = transientFormDataEntity?.formData || {};

    return res.status(HttpStatusCode.Ok).send(formData);
  } catch (error) {
    const errorMessage = `Failed to get fee record correction request transient form data`;
    console.error('%s %o', errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
