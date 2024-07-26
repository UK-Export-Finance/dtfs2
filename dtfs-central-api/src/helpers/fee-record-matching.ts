import { FeeRecordEntity, PaymentEntity } from '@ukef/dtfs2-common';
import Big from 'big.js';
import { EntityManager } from 'typeorm';
import { getActivePaymentMatchingTolerances } from '../services/utilisation-reports/payment-matching-tolerance.service';

const calculateTotal = (values: number[]): Big => {
  return values.reduce((total, value) => total.add(value), new Big(0));
};

export const feeRecordsAndPaymentsMatch = async (
  feeRecords: FeeRecordEntity[],
  payments: PaymentEntity[],
  transactionEntityManager: EntityManager,
): Promise<boolean> => {
  if (feeRecords.length === 0) {
    throw new Error('Cannot determine match status for empty array of fee records');
  }

  const reportedPayments = feeRecords.map((feeRecord) => feeRecord.getFeesPaidToUkefForThePeriodInThePaymentCurrency());
  const totalReportedPayments = calculateTotal(reportedPayments);

  const paymentsReceived = payments.map((payment) => payment.amount);
  const totalPaymentsReceived = calculateTotal(paymentsReceived);

  const difference = totalReportedPayments.minus(totalPaymentsReceived).abs();

  const tolerances = await getActivePaymentMatchingTolerances(transactionEntityManager);
  const tolerance = tolerances[feeRecords[0].paymentCurrency];

  if (difference.gt(tolerance)) {
    return false;
  }
  return true;
};
