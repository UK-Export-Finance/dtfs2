import {
  CurrencyAndAmount,
  FeeRecordEntity,
  PaymentEntity,
  ReportPeriod,
  SelectedFeeRecordDetails,
  SelectedFeeRecordsDetails,
  SelectedFeeRecordsPaymentDetails,
} from '@ukef/dtfs2-common';
import { getBankNameById } from '../../../../repositories/banks-repo';
import { NotFoundError } from '../../../../errors';
import { mapFeeRecordEntityToReportedFees, mapFeeRecordEntityToReportedPayments } from '../../../../mapping/fee-record-mapper';

const mapPaymentEntityToSelectedFeeRecordsPaymentDetails = (paymentEntity: PaymentEntity): SelectedFeeRecordsPaymentDetails => ({
  value: { amount: paymentEntity.amount, currency: paymentEntity.currency },
  reference: paymentEntity.reference,
  dateReceived: paymentEntity.dateReceived,
});

const mapFeeRecordEntityToSelectedFeeRecordDetails = (feeRecordEntity: FeeRecordEntity): SelectedFeeRecordDetails => ({
  id: feeRecordEntity.id,
  facilityId: feeRecordEntity.facilityId,
  exporter: feeRecordEntity.exporter,
  reportedFee: mapFeeRecordEntityToReportedFees(feeRecordEntity),
  reportedPayments: mapFeeRecordEntityToReportedPayments(feeRecordEntity),
});

const getTotalReportedPayments = (feeRecords: SelectedFeeRecordDetails[]): CurrencyAndAmount => ({
  currency: feeRecords[0]?.reportedPayments.currency,
  amount: feeRecords.map((feeRecord) => feeRecord.reportedPayments.amount).reduce((total, currentAmount) => total + currentAmount, 0),
});

export const mapToSelectedFeeRecordDetails = async (
  bankId: string,
  reportPeriod: ReportPeriod,
  selectedFeeRecordEntities: FeeRecordEntity[],
): Promise<SelectedFeeRecordsDetails> => {
  const bankName = await getBankNameById(bankId);
  if (!bankName) {
    throw new NotFoundError(`Failed to find a bank with id '${bankId}'`);
  }

  // On the premium payments tab it is only possible to select fee records with no linked payments or a single group of fee records all having the same linked payments
  const distinctPaymentsForFeeRecords = selectedFeeRecordEntities[0].payments;
  const recordedPaymentDetails = distinctPaymentsForFeeRecords.map((paymentEntity) => mapPaymentEntityToSelectedFeeRecordsPaymentDetails(paymentEntity));
  const selectedFeeRecordDetails = selectedFeeRecordEntities.map((feeRecordEntity) => mapFeeRecordEntityToSelectedFeeRecordDetails(feeRecordEntity));

  return {
    bank: { name: bankName },
    reportPeriod,
    totalReportedPayments: getTotalReportedPayments(selectedFeeRecordDetails),
    feeRecords: selectedFeeRecordDetails,
    payments: recordedPaymentDetails ?? [],
  };
};
