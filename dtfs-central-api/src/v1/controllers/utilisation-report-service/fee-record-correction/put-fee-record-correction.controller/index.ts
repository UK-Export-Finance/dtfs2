import { ApiError, ReportPeriod, REQUEST_PLATFORM_TYPE } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest } from '../../../../../types/custom-express-request';
import { NotFoundError } from '../../../../../errors';
import { FeeRecordCorrectionRepo } from '../../../../../repositories/fee-record-correction-repo';
import { FeeRecordCorrectionTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-transient-form-data-repo';
import { PutFeeRecordCorrectionPayload } from '../../../../routes/middleware/payload-validation';
import { executeWithSqlTransaction } from '../../../../../helpers';
import { FEE_RECORD_EVENT_TYPE } from '../../../../../services/state-machines/fee-record/event/fee-record.event-type';
import { FeeRecordStateMachine } from '../../../../../services/state-machines/fee-record/fee-record.state-machine';
import { sendFeeRecordCorrectionReceivedEmails } from './helpers';

export type PutFeeRecordCorrectionRequest = CustomExpressRequest<{
  params: {
    bankId: string;
    correctionId: string;
  };
  reqBody: PutFeeRecordCorrectionPayload;
}>;

/**
 * Controller for the PUT fee record correction route.
 *
 * - Fetches the fee record correction transient form data for the
 * requesting user and correction id combination.
 * - Updates the fee record with the corrected values and sets the
 * status to TO_DO_AMENDED.
 * - Saves the old and new values against the record correction for
 * record correction history log.
 * - Deletes the transient form data.
 * - Sends confirmation email to the bank payment report officer team.
 * - Sends notification email to PDC team.
 *
 * @param req - The {@link PutFeeRecordCorrectionRequest} request object
 * @param res - The response object
 */
export const putFeeRecordCorrection = async (req: PutFeeRecordCorrectionRequest, res: Response) => {
  try {
    const { correctionId: correctionIdString, bankId } = req.params;
    const { user } = req.body;

    const correctionId = Number(correctionIdString);
    const userId = user._id;

    const { sentToEmails, reportPeriod } = await executeWithSqlTransaction<{ sentToEmails: string[]; reportPeriod: ReportPeriod }>(
      async (transactionEntityManager) => {
        const correctionEntity = await FeeRecordCorrectionRepo.withTransaction(transactionEntityManager).findOneByIdAndBankIdWithFeeRecordAndReport(
          correctionId,
          bankId,
        );

        if (!correctionEntity) {
          throw new NotFoundError(`Failed to find a correction with id '${correctionId}' for bank id '${bankId}'`);
        }

        const transientFormDataEntity = await FeeRecordCorrectionTransientFormDataRepo.withTransaction(transactionEntityManager).findByUserIdAndCorrectionId(
          userId,
          correctionId,
        );

        if (!transientFormDataEntity) {
          throw new NotFoundError(`Failed to find transient form data with user id '${userId}' for correction id '${correctionId}'`);
        }

        const feeRecordStateMachine = FeeRecordStateMachine.forFeeRecord(correctionEntity.feeRecord);

        await feeRecordStateMachine.handleEvent({
          type: FEE_RECORD_EVENT_TYPE.CORRECTION_RECEIVED,
          payload: {
            transactionEntityManager,
            correctionEntity,
            correctionFormData: transientFormDataEntity.formData,
            requestSource: {
              platform: REQUEST_PLATFORM_TYPE.PORTAL,
              userId: user._id.toString(),
            },
          },
        });

        await FeeRecordCorrectionTransientFormDataRepo.withTransaction(transactionEntityManager).deleteByUserIdAndCorrectionId(userId, correctionId);

        const { exporter } = correctionEntity.feeRecord;

        const { emails } = await sendFeeRecordCorrectionReceivedEmails(exporter, bankId);

        return { reportPeriod: correctionEntity.feeRecord.report.reportPeriod, sentToEmails: emails };
      },
    );

    return res.status(HttpStatusCode.Ok).send({ sentToEmails, reportPeriod });
  } catch (error) {
    const errorMessage = 'Failed to put fee record correction';
    console.error('%s %o', errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
