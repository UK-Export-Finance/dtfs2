import { Response } from 'express';
import { HttpStatusCode } from 'axios';
import { ApiError, CustomExpressRequest, FEE_RECORD_STATUS } from '@ukef/dtfs2-common';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';
import { NotFoundError } from '../../../../errors';
import { executeWithSqlTransaction } from '../../../../helpers';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';
import { PostKeyingDataPayload } from '../../../routes/middleware/payload-validation';

export type PostKeyingDataRequest = CustomExpressRequest<{
  reqBody: PostKeyingDataPayload;
}>;

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
        type: 'GENERATE_KEYING_DATA',
        payload: {
          transactionEntityManager,
          feeRecordsAtMatchStatusWithPayments,
          requestSource: {
            platform: 'TFM',
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
