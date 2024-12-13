import { ApiError, REQUEST_PLATFORM_TYPE } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest } from '../../../../../types/custom-express-request';
import { executeWithSqlTransaction } from '../../../../../helpers';
import { FeeRecordStateMachine } from '../../../../../services/state-machines/fee-record/fee-record.state-machine';
import { FEE_RECORD_EVENT_TYPE } from '../../../../../services/state-machines/fee-record/event/fee-record.event-type';
import { FeeRecordCorrectionTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-transient-form-data-repo';
import { NotFoundError } from '../../../../../errors';
import { PostFeeRecordCorrectionPayload } from '../../../../routes/middleware/payload-validation';
import { FeeRecordRepo } from '../../../../../repositories/fee-record-repo';
import { sendFeeRecordCorrectionRequestEmails } from './helpers';

export type PostFeeRecordCorrectionRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    feeRecordId: string;
  };
  reqBody: PostFeeRecordCorrectionPayload;
}>;

/**
 * Controller for the POST fee record correction endpoint
 *
 * Creates a new fee record correction based on the saved transient form data
 * for the requesting user and fee record.
 *
 * Updates the fee record status to PENDING_CORRECTION.
 *
 * Deletes transient form data for the requesting user and fee record.
 *
 * Sends fee record correction request emails
 *
 * @param req - The request object
 * @param res - The response object
 */
export const postFeeRecordCorrection = async (req: PostFeeRecordCorrectionRequest, res: Response) => {
  const { reportId: reportIdString, feeRecordId: feeRecordIdString } = req.params;
  const { user } = req.body;

  try {
    const reportId = Number(reportIdString);
    const feeRecordId = Number(feeRecordIdString);
    const userId = user._id.toString();

    await executeWithSqlTransaction(async (transactionEntityManager) => {
      const formDataEntity = await FeeRecordCorrectionTransientFormDataRepo.withTransaction(transactionEntityManager).findByUserIdAndFeeRecordId(
        userId,
        feeRecordId,
      );

      if (!formDataEntity) {
        throw new NotFoundError(`Failed to find record correction form data for user id: ${userId} and fee record id: ${feeRecordId}`);
      }

      const { reasons, additionalInfo } = formDataEntity.formData;

      const feeRecord = await FeeRecordRepo.withTransaction(transactionEntityManager).findOneByIdAndReportIdWithReport(feeRecordId, reportId);

      if (!feeRecord) {
        throw new NotFoundError(`Failed to find a fee record with id ${feeRecordId} and report id ${reportId}`);
      }

      const stateMachine = FeeRecordStateMachine.forFeeRecord(feeRecord);

      await stateMachine.handleEvent({
        type: FEE_RECORD_EVENT_TYPE.CORRECTION_REQUESTED,
        payload: {
          transactionEntityManager,
          requestedByUser: {
            id: userId,
            firstName: user.firstName,
            lastName: user.lastName,
          },
          reasons,
          additionalInfo,
          requestSource: {
            platform: REQUEST_PLATFORM_TYPE.TFM,
            userId,
          },
        },
      });

      await FeeRecordCorrectionTransientFormDataRepo.withTransaction(transactionEntityManager).deleteByUserIdAndFeeRecordId(userId, feeRecordId);

      await sendFeeRecordCorrectionRequestEmails(reasons, feeRecord.report.reportPeriod, feeRecord.exporter, feeRecord.report.bankId, user.email);
    });

    return res.sendStatus(HttpStatusCode.Ok);
  } catch (error) {
    const errorMessage = 'Failed to create record correction';
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
