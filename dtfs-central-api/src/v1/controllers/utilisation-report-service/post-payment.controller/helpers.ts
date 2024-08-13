import { In } from 'typeorm';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';
import { InvalidPayloadError, NotFoundError } from '../../../../errors';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';
import { TfmSessionUser } from '../../../../types/tfm/tfm-session-user';
import { NewPaymentDetails } from '../../../../types/utilisation-reports';
import { executeWithSqlTransaction } from '../../../../helpers';

/**
 * Adds a payment to the utilisation report with the specified id
 * @param reportId - The report id
 * @param feeRecordIds - The fee record ids linked to the payment
 * @param user - The user adding the payment
 * @param payment - The payment to add
 */
export const addPaymentToUtilisationReport = async (reportId: number, feeRecordIds: number[], user: TfmSessionUser, payment: NewPaymentDetails) => {
  const utilisationReportStateMachine = await UtilisationReportStateMachine.forReportId(reportId);

  const feeRecords = await FeeRecordRepo.findBy({ id: In(feeRecordIds) });
  if (feeRecords.length === 0) {
    throw new NotFoundError(`No fee records found for report with id ${reportId}`);
  }

  const isValidPaymentCurrency = feeRecords.every(({ paymentCurrency }) => paymentCurrency === payment.currency);
  if (!isValidPaymentCurrency) {
    throw new InvalidPayloadError(`Payment currency '${payment.currency}' does not match fee record payment currency`);
  }

  await executeWithSqlTransaction(async (transactionEntityManager) => {
    await utilisationReportStateMachine.handleEvent({
      type: 'ADD_A_PAYMENT',
      payload: {
        transactionEntityManager,
        feeRecords,
        paymentDetails: payment,
        requestSource: {
          platform: 'TFM',
          userId: user._id.toString(),
        },
      },
    });
  });
};
