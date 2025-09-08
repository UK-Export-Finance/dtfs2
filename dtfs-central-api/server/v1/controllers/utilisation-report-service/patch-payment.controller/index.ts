import { Response } from 'express';
import { HttpStatusCode } from 'axios';
import { CustomExpressRequest, ApiError, REQUEST_PLATFORM_TYPE } from '@ukef/dtfs2-common';
import { PatchPaymentPayload } from '../../../routes/middleware/payload-validation/validate-patch-payment-payload';
import { executeWithSqlTransaction } from '../../../../helpers';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';
import { PaymentRepo } from '../../../../repositories/payment-repo';
import { NotFoundError } from '../../../../errors';
import { UTILISATION_REPORT_EVENT_TYPE } from '../../../../services/state-machines/utilisation-report/event/utilisation-report.event-type';

export type PatchPaymentRequest = CustomExpressRequest<{
  reqBody: PatchPaymentPayload;
}>;

export const patchPayment = async (req: PatchPaymentRequest, res: Response) => {
  const { reportId, paymentId } = req.params;
  const { paymentAmount, datePaymentReceived, paymentReference, user } = req.body;

  try {
    const payment = await PaymentRepo.findOneByIdWithFeeRecordsAndReportFilteredById(Number(paymentId), Number(reportId));
    if (!payment) {
      throw new NotFoundError(`Failed to find a payment with id '${paymentId}' linked to report with id '${reportId}'`);
    }

    const utilisationReport = payment.feeRecords.at(0)?.report;
    if (!utilisationReport) {
      throw new Error('The found payment does not have a defined report in the feeRecords');
    }

    const utilisationReportStateMachine = UtilisationReportStateMachine.forReport(utilisationReport);
    await executeWithSqlTransaction(
      async (transactionEntityManager) =>
        await utilisationReportStateMachine.handleEvent({
          type: UTILISATION_REPORT_EVENT_TYPE.EDIT_PAYMENT,
          payload: {
            transactionEntityManager,
            payment,
            feeRecords: payment.feeRecords,
            paymentAmount,
            datePaymentReceived,
            paymentReference,
            requestSource: {
              platform: REQUEST_PLATFORM_TYPE.TFM,
              userId: user._id.toString(),
            },
          },
        }),
    );

    return res.sendStatus(HttpStatusCode.Ok);
  } catch (error) {
    const errorMessage = 'Failed to edit payment';
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
