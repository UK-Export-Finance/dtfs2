import { Response } from 'express';
import { HttpStatusCode } from 'axios';
import { ApiError, CustomExpressRequest, FEE_RECORD_STATUS, REQUEST_PLATFORM_TYPE } from '@ukef/dtfs2-common';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';
import { NotFoundError } from '../../../../errors';
import { executeWithSqlTransaction } from '../../../../helpers';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';
import { PostKeyingDataPayload } from '../../../routes/middleware/payload-validation';
import { UTILISATION_REPORT_EVENT_TYPE } from '../../../../services/state-machines/utilisation-report/event/utilisation-report.event-type';

export type PostKeyingDataRequest = CustomExpressRequest<{
  reqBody: PostKeyingDataPayload;
}>;

/**
 * Handles the post keying data request.
 *
 * This will generate keying data for all the fee records at MATCH status
 * attached to the report with the supplied id.
 *
 * For a fee with no payments there will be nothing to key.
 *
 * For a fee with payment(s) not in a group, the keying data will simply
 * be the payment amount.
 *
 * For a group of fees sharing a payment, the keying data will be generated
 * by splitting the payment amounts across the fees in the group.
 *
 * @param req - The request
 * @param res - The response
 */
export const postKeyingData = async (req: PostKeyingDataRequest, res: Response) => {
  const { reportId } = req.params;
  const { user } = req.body;

  try {
    const feeRecordsAtMatchStatusWithPayments = await FeeRecordRepo.findByReportIdAndStatusesWithReportAndPayments(Number(reportId), [FEE_RECORD_STATUS.MATCH]);

    if (feeRecordsAtMatchStatusWithPayments.length === 0) {
      throw new NotFoundError(`Failed to find any fee records which can be keyed attached to report with id '${reportId}'`);
    }

    const utilisationReport = feeRecordsAtMatchStatusWithPayments[0].report;
    if (!utilisationReport) {
      throw new Error('The report on the found fee records is not defined');
    }

    const utilisationReportStateMachine = UtilisationReportStateMachine.forReport(utilisationReport);
    await executeWithSqlTransaction((transactionEntityManager) =>
      utilisationReportStateMachine.handleEvent({
        type: UTILISATION_REPORT_EVENT_TYPE.GENERATE_KEYING_DATA,
        payload: {
          transactionEntityManager,
          feeRecordsAtMatchStatusWithPayments,
          requestSource: {
            platform: REQUEST_PLATFORM_TYPE.TFM,
            userId: user._id.toString(),
          },
        },
      }),
    );

    return res.sendStatus(HttpStatusCode.Ok);
  } catch (error) {
    const errorMessage = 'Failed to generate keying data';
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
