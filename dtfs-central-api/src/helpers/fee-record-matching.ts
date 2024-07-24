import { FeeRecordEntity, PaymentEntity } from '@ukef/dtfs2-common';
import Big from 'big.js';
import { PaymentMatchingTolerances } from '../types/payment-matching-tolerances';

export const feeRecordsAndPaymentsMatch = (feeRecords: FeeRecordEntity[], payments: PaymentEntity[], tolerances: PaymentMatchingTolerances): boolean => {
  if (feeRecords.length === 0) {
    throw new Error('Cannot determine match status for empty array of fee records');
  }
  const totalReportedPayments = feeRecords
    .map((feeRecord) => feeRecord.getFeesPaidToUkefForThePeriodInThePaymentCurrency())
    .reduce((total, reportedFeesPaid) => total.add(reportedFeesPaid), new Big(0));

  const totalPaymentsReceived = payments.map((payment) => payment.amount).reduce((total, amount) => total.add(amount), new Big(0));

  const difference = totalReportedPayments.minus(totalPaymentsReceived).abs();
  const tolerance = tolerances[feeRecords[0].paymentCurrency];
  if (difference.gt(tolerance)) {
    return false;
  }
  return true;
};
