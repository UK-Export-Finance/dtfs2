import { Response } from 'express';
import { HttpStatusCode } from 'axios';
import { ApiError, REQUEST_PLATFORM_TYPE } from '@ukef/dtfs2-common';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { executeWithSqlTransaction } from '../../../../helpers';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';
import { PutKeyingDataMarkAsPayload } from '../../../routes/middleware/payload-validation';
import { getSelectedFeeRecordsAndUtilisationReportForKeyingDataMarkAs } from '../helpers';

export type PutKeyingDataMarkDoneRequest = CustomExpressRequest<{
  reqBody: PutKeyingDataMarkAsPayload;
}>;

export const putKeyingDataMarkAsDone = async (req: PutKeyingDataMarkDoneRequest, res: Response) => {
  const { reportId } = req.params;
  const { feeRecordIds: selectedFeeRecordIds, user } = req.body;

  try {
    const { selectedFeeRecords, utilisationReport } = await getSelectedFeeRecordsAndUtilisationReportForKeyingDataMarkAs(
      Number(reportId),
      selectedFeeRecordIds,
    );

    const utilisationReportStateMachine = UtilisationReportStateMachine.forReport(utilisationReport);
    await executeWithSqlTransaction(
      async (transactionEntityManager) =>
        await utilisationReportStateMachine.handleEvent({
          type: 'MARK_FEE_RECORDS_AS_RECONCILED',
          payload: {
            transactionEntityManager,
            feeRecordsToReconcile: selectedFeeRecords,
            reconciledByUserId: user._id.toString(),
            requestSource: {
              platform: REQUEST_PLATFORM_TYPE.TFM,
              userId: user._id.toString(),
            },
          },
        }),
    );

    return res.sendStatus(HttpStatusCode.Ok);
  } catch (error) {
    const errorMessage = `Failed to mark keying data with fee record ids ${selectedFeeRecordIds.join(', ')} from report with id ${reportId} as DONE`;
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
