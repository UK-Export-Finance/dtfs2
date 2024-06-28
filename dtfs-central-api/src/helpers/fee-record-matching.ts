import { FeeRecordEntity, PaymentEntity } from '@ukef/dtfs2-common';
import Big from 'big.js';

export const feeRecordsAndPaymentsMatch = (feeRecords: FeeRecordEntity[], payments: PaymentEntity[]): boolean => {
  const totalReportedPayments = feeRecords
    .map((feeRecord) => feeRecord.getFeesPaidToUkefForThePeriodInThePaymentCurrency())
    .reduce((total, reportedFeesPaid) => total.add(reportedFeesPaid), new Big(0));

  const totalPaymentsReceived = payments.map((payment) => payment.amount).reduce((total, amount) => total.add(amount), new Big(0));

  const difference = totalReportedPayments.minus(totalPaymentsReceived).abs();
  const tolerance = 0;
  if (difference.gt(tolerance)) {
    return false;
  }
  return true;
};
