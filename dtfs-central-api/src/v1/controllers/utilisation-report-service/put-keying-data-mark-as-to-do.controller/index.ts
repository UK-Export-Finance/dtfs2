import { Response } from 'express';
import { HttpStatusCode } from 'axios';
import { ApiError } from '@ukef/dtfs2-common';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { executeWithSqlTransaction } from '../../../../helpers';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';
import { PutKeyingDataMarkAsPayload } from '../../../routes/middleware/payload-validation';
import { getUtilisationReportAndValidateSelectedFeeRecordsExist } from '../helpers';

export type PutKeyingDataMarkToDoRequest = CustomExpressRequest<{
  reqBody: PutKeyingDataMarkAsPayload;
}>;

export const putKeyingDataMarkAsToDo = async (req: PutKeyingDataMarkToDoRequest, res: Response) => {
  const { reportId } = req.params;
  const { feeRecordIds: selectedFeeRecordIds, user } = req.body;

  try {
    const utilisationReport = await getUtilisationReportAndValidateSelectedFeeRecordsExist(Number(reportId), selectedFeeRecordIds);

    const utilisationReportStateMachine = UtilisationReportStateMachine.forReport(utilisationReport);
    await executeWithSqlTransaction(
      async (transactionEntityManager) =>
        await utilisationReportStateMachine.handleEvent({
          type: 'MARK_FEE_RECORDS_AS_READY_TO_KEY',
          payload: {
            transactionEntityManager,
            feeRecordIds: selectedFeeRecordIds,
            requestSource: {
              platform: 'TFM',
              userId: user._id.toString(),
            },
          },
        }),
    );

    return res.sendStatus(HttpStatusCode.Ok);
  } catch (error) {
    const errorMessage = `Failed to mark keying data with fee record ids ${selectedFeeRecordIds.join(', ')} from report with id ${reportId} as TO DO`;
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
