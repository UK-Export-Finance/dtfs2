import { ApiError, CustomExpressRequest, RecordCorrectionReason, ReportPeriod, SessionBank, FEE_RECORD_STATUS, STATUS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { HttpStatusCode } from 'axios';
import { getBankById } from '../../../../../repositories/banks-repo';
import { FeeRecordRepo } from '../../../../../repositories/fee-record-repo';
import { NotFoundError } from '../../../../../errors';
import { FeeRecordCorrectionRequestTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-request-transient-form-data-repo';

export type GetFeeRecordCorrectionRequestReviewRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    feeRecordId: string;
    userId: string;
  };
}>;

const INVALID_STATUS = STATUS.INVALID;

export type InvalidStatusType = typeof INVALID_STATUS;

/**
 * Response body type for the GET fee record correction request review route.
 */
export type GetFeeRecordCorrectionRequestReviewResponseBody =
  | {
      bank: SessionBank;
      reportPeriod: ReportPeriod;
      correctionRequestDetails: {
        facilityId: string;
        exporter: string;
        reasons: RecordCorrectionReason[];
        additionalInfo: string;
        contactEmailAddresses: string[];
      };
    }
  | { errorKey: InvalidStatusType };

type GetFeeRecordCorrectionRequestReviewResponse = Response<GetFeeRecordCorrectionRequestReviewResponseBody | string>;

/**
 * Controller for the GET fee record correction request review route.
 *
 * Fetches the transient form data for the user and fee record id along
 * with the other information used for the record correction email for
 * the requesting user to review before sending their request.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A promise that resolves to the response containing the fee record correction request review.
 */
export const getFeeRecordCorrectionRequestReview = async (
  req: GetFeeRecordCorrectionRequestReviewRequest,
  res: GetFeeRecordCorrectionRequestReviewResponse,
) => {
  const { reportId: reportIdString, feeRecordId: feeRecordIdString, userId } = req.params;

  try {
    const reportId = Number(reportIdString);
    const feeRecordId = Number(feeRecordIdString);

    const feeRecord = await FeeRecordRepo.findOneByIdAndReportIdWithReport(feeRecordId, reportId);

    if (!feeRecord) {
      throw new NotFoundError(`Failed to find fee record with id: ${feeRecordId} and reportId: ${reportId}`);
    }

    /**
     * if fee record status us PENDING_CORRECTION then it means record correction request has been submitted
     * should return errorKey if so
     */
    if (feeRecord.status === FEE_RECORD_STATUS.PENDING_CORRECTION) {
      return res.status(HttpStatusCode.Ok).send({
        errorKey: STATUS.INVALID,
      });
    }

    const formDataEntity = await FeeRecordCorrectionRequestTransientFormDataRepo.findByUserIdAndFeeRecordId(userId, feeRecordId);

    if (!formDataEntity) {
      throw new NotFoundError(`Failed to find fee record correction request transient form data with userId: ${userId} and feeRecordId: ${feeRecordId}`);
    }

    const { report } = feeRecord;
    const { bankId } = report;

    const bank = await getBankById(bankId);

    if (!bank) {
      throw new NotFoundError(`Failed to find bank with id: ${bankId}`);
    }

    const { reasons, additionalInfo } = formDataEntity.formData;

    return res.status(HttpStatusCode.Ok).send({
      bank: {
        id: bank.id,
        name: bank.name,
      },
      reportPeriod: report.reportPeriod,
      correctionRequestDetails: {
        facilityId: feeRecord.facilityId,
        exporter: feeRecord.exporter,
        reasons,
        additionalInfo,
        contactEmailAddresses: bank.paymentOfficerTeam.emails,
      },
    });
  } catch (error) {
    const errorMessage = `Failed to get fee record correction request review`;
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
