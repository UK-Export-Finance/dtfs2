import { EntityManager } from 'typeorm';
import { FeeRecordEntity, PaymentEntity } from '@ukef/dtfs2-common';
import Big from 'big.js';

const getPaymentsAttachedToFeeRecord = async (feeRecord: FeeRecordEntity, transactionEntityManager: EntityManager): Promise<PaymentEntity[]> => {
  const feeRecordsWithPayments = await transactionEntityManager.find(FeeRecordEntity, {
    where: { id: feeRecord.id },
    relations: { payments: true },
  });
  return feeRecordsWithPayments[0].payments;
};

export const feeRecordsMatchAttachedPayments = async (feeRecords: FeeRecordEntity[], transactionEntityManager: EntityManager): Promise<boolean> => {
  const totalReportedPayments = feeRecords
    .map((feeRecord) => feeRecord.getFeesPaidToUkefForThePeriodInThePaymentCurrency())
    .reduce((total, reportedFeesPaid) => total.add(reportedFeesPaid), new Big(0));

  const attachedPayments = await getPaymentsAttachedToFeeRecord(feeRecords[0], transactionEntityManager);

  const totalPaymentsReceived = attachedPayments
    .map((payment) => payment.amountReceived)
    .reduce((total, amountReceived) => total.add(amountReceived), new Big(0));

  const difference = totalReportedPayments.minus(totalPaymentsReceived).abs();
  const tolerance = 0;
  if (difference.gt(tolerance)) {
    return false;
  }
  return true;
};
