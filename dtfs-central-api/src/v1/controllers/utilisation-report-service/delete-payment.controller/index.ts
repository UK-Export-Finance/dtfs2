import { ApiError } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { executeWithSqlTransaction } from '../../../../helpers';
import { TfmSessionUser } from '../../../../types/tfm/tfm-session-user';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';

export type DeletePaymentRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    paymentId: string;
  };
  reqBody: {
    user: {
      _id: TfmSessionUser['_id'];
    };
  };
}>;

/**
 * Controller for the DELETE payment route
 * @param req - The request object
 * @param res - The response object
 */
export const deletePayment = async (req: DeletePaymentRequest, res: Response) => {
  const { reportId, paymentId } = req.params;
  const { user } = req.body;

  try {
    const utilisationReportStateMachine = await UtilisationReportStateMachine.forReportId(Number(reportId));

    await executeWithSqlTransaction(async (transactionEntityManager) => {
      await utilisationReportStateMachine.handleEvent({
        type: 'DELETE_PAYMENT',
        payload: {
          transactionEntityManager,
          paymentId: Number(paymentId),
          requestSource: {
            platform: 'TFM',
            userId: user._id.toString(),
          },
        },
      });
    });
    return res.sendStatus(HttpStatusCode.Ok);
  } catch (error) {
    const errorMessage = `Failed to delete payment with id ${paymentId}`;
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(500).send(errorMessage);
  }
};
