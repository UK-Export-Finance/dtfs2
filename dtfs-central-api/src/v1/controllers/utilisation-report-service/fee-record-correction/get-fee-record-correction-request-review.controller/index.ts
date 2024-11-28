import { ApiError, CustomExpressRequest, ReportPeriod, SessionBank } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { HttpStatusCode } from 'axios';
import { getBankById } from '../../../../../repositories/banks-repo';
import { FeeRecordRepo } from '../../../../../repositories/fee-record-repo';
import { NotFoundError } from '../../../../../errors';
import { FeeRecordCorrectionTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-transient-form-data-repo';

export type GetFeeRecordCorrectionRequestReviewRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    feeRecordId: string;
    userId: string;
  };
}>;

/**
 * Response body type for the GET fee record correction request review route.
 */
export type GetFeeRecordCorrectionRequestReviewResponseBody = {
  bank: SessionBank;
  reportPeriod: ReportPeriod;
  correctionRequestDetails: {
    facilityId: string;
    exporter: string;
    reasons: string[];
    additionalInfo: string;
    contactEmailAddress: string;
  };
};

type GetFeeRecordCorrectionRequestReviewResponse = Response<GetFeeRecordCorrectionRequestReviewResponseBody | string>;

// QQ unit tests
/**
 * Controller for the GET fee record correction request review route.
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

    const formDataEntity = await FeeRecordCorrectionTransientFormDataRepo.findByUserIdAndFeeRecordId(userId, feeRecordId);

    if (!formDataEntity) {
      throw new NotFoundError(`Failed to find fee record correction transient form data with userId: ${userId} and feeRecordId: ${feeRecordId}`);
    }

    const feeRecord = await FeeRecordRepo.findOneByIdAndReportIdWithReport(feeRecordId, reportId);

    if (!feeRecord) {
      throw new NotFoundError(`Failed to find fee record with id: ${feeRecordId} and reportId: ${reportId}`);
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
        contactEmailAddress: bank.paymentOfficerTeam.emails[0],
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
