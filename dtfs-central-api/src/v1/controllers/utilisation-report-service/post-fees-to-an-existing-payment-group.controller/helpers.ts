import { FeeRecordEntity, PaymentEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { TfmSessionUser } from '../../../../types/tfm/tfm-session-user';
import { executeWithSqlTransaction } from '../../../../helpers';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';

export const addFeesToAnExistingPaymentGroup = async (
  utilisationReport: UtilisationReportEntity,
  feeRecordsToAdd: FeeRecordEntity[],
  otherFeeRecordsInPaymentGroup: FeeRecordEntity[],
  payments: PaymentEntity[],
  user: TfmSessionUser,
) => {
  const utilisationReportStateMachine = UtilisationReportStateMachine.forReport(utilisationReport);

  await executeWithSqlTransaction(async (transactionEntityManager) => {
    await utilisationReportStateMachine.handleEvent({
      type: 'ADD_FEES_TO_AN_EXISTING_PAYMENT_GROUP',
      payload: {
        transactionEntityManager,
        feeRecordsToAdd,
        otherFeeRecordsInPaymentGroup,
        payments,
        requestSource: {
          platform: 'TFM',
          userId: user._id.toString(),
        },
      },
    });
  });
};

const getPaymentFeeRecordIds = (payment: PaymentEntity) => {
  return payment.feeRecords.map((record) => record.id);
};

export const ensureAllPaymentsHaveSameFeeRecords = (payments: PaymentEntity[]) => {
  const [firstPayment, ...otherPayments] = payments;
  const firstPaymentFeeRecordIds = getPaymentFeeRecordIds(firstPayment);

  otherPayments.forEach((payment) => {
    const currentPaymentFeeRecordIds = getPaymentFeeRecordIds(payment);
    if (
      firstPaymentFeeRecordIds.length !== currentPaymentFeeRecordIds.length ||
      !firstPaymentFeeRecordIds.every((id) => currentPaymentFeeRecordIds.includes(id))
    ) {
      throw new Error('All payments in the group must have the same set of fee records.');
    }
  });
};

export const ensurePaymentIdsMatchFirstFeeRecordPaymentIds = (payments: PaymentEntity[], paymentIds: number[]) => {
  if (payments.length === 0 || payments.at(0)?.feeRecords.length === 0) {
    throw new Error('No payments or fee records found.');
  }

  const firstFeeRecordPaymentIds = payments
    .at(0)
    ?.feeRecords.at(0)
    ?.payments.map((payment) => payment.id);

  if (!firstFeeRecordPaymentIds || firstFeeRecordPaymentIds.length !== paymentIds.length) {
    throw new Error('The number of payment IDs does not match.');
  }

  const mismatchedIds = firstFeeRecordPaymentIds.filter((id) => !paymentIds.includes(id));
  if (mismatchedIds.length > 0) {
    throw new Error('The payment IDs do not match the IDs of the payments attached to the first fee record.');
  }
};
