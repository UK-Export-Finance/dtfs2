import { Response } from 'express';
import { HttpStatusCode } from 'axios';
import { ApiError, CustomExpressRequest } from '@ukef/dtfs2-common';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';
import { NotFoundError } from '../../../../errors';
import { executeWithSqlTransaction } from '../../../../helpers';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';
import { getGenerateKeyingDataDetails } from './helpers';
import { PostKeyingDataPayload } from '../../../routes/middleware/payload-validation';

export type PostKeyingDataRequest = CustomExpressRequest<{
  reqBody: PostKeyingDataPayload;
}>;

export const postKeyingData = async (req: PostKeyingDataRequest, res: Response) => {
  const { reportId } = req.params;
  const { user } = req.body;

  try {
    const feeRecordsWhichCanBeKeyed = await FeeRecordRepo.findByReportIdAndStatusesWithReport(Number(reportId), ['MATCH']);

    if (feeRecordsWhichCanBeKeyed.length === 0) {
      throw new NotFoundError(`Failed to find any fee records which can be keyed attached to report with id '${reportId}'`);
    }

    const utilisationReport = feeRecordsWhichCanBeKeyed[0].report;
    if (!utilisationReport) {
      throw new Error('The report on the found fee records is not defined');
    }

    const generateKeyingDataDetails = await getGenerateKeyingDataDetails(feeRecordsWhichCanBeKeyed);

    const utilisationReportStateMachine = UtilisationReportStateMachine.forReport(utilisationReport);
    await executeWithSqlTransaction((transactionEntityManager) =>
      utilisationReportStateMachine.handleEvent({
        type: 'GENERATE_KEYING_DATA',
        payload: {
          transactionEntityManager,
          generateKeyingDataDetails,
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
