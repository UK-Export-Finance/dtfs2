import { ApiError, REQUEST_PLATFORM_TYPE } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { UTILISATION_REPORT_EVENT_TYPE } from '../../../../services/state-machines/utilisation-report/event/utilisation-report.event-type';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { executeWithSqlTransaction } from '../../../../helpers';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';
import { DeletePaymentPayload } from '../../../routes/middleware/payload-validation/validate-delete-payment-payload';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';
import { NotFoundError } from '../../../../errors';

export type DeletePaymentRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    paymentId: string;
  };
  reqBody: DeletePaymentPayload;
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
    const utilisationReport = await UtilisationReportRepo.findOne({
      where: {
        id: Number(reportId),
        feeRecords: {
          payments: {
            id: Number(paymentId),
          },
        },
      },
    });

    if (!utilisationReport) {
      throw new NotFoundError(`Failed to find a report with id '${reportId}' with attached payment with id '${paymentId}'`);
    }

    const utilisationReportStateMachine = UtilisationReportStateMachine.forReport(utilisationReport);

    await executeWithSqlTransaction(async (transactionEntityManager) => {
      await utilisationReportStateMachine.handleEvent({
        type: UTILISATION_REPORT_EVENT_TYPE.DELETE_PAYMENT,
        payload: {
          transactionEntityManager,
          paymentId: Number(paymentId),
          requestSource: {
            platform: REQUEST_PLATFORM_TYPE.TFM,
            userId: user._id.toString(),
          },
        },
      });
    });
    return res.sendStatus(HttpStatusCode.Ok);
  } catch (error) {
    const errorMessage = `Failed to delete payment with id ${paymentId}`;
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
