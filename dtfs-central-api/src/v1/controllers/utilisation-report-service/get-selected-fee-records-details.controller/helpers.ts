import { CurrencyAndAmount, FeeRecordEntity, ReportPeriod, SelectedFeeRecordDetails, SelectedFeeRecordsDetails } from '@ukef/dtfs2-common';
import { getBankNameById } from '../../../../repositories/banks-repo';
import { NotFoundError } from '../../../../errors';
import { mapFeeRecordEntityToReportedFees, mapFeeRecordEntityToReportedPayments } from '../../../../mapping/fee-record-mapper';

const mapFeeRecordEntityToSelectedFeeRecordDetails = (feeRecordEntity: FeeRecordEntity): SelectedFeeRecordDetails => ({
  id: feeRecordEntity.id,
  facilityId: feeRecordEntity.facilityId,
  exporter: feeRecordEntity.exporter,
  reportedFee: mapFeeRecordEntityToReportedFees(feeRecordEntity),
  reportedPayment: mapFeeRecordEntityToReportedPayments(feeRecordEntity),
});

const getTotalReportedPayments = (feeRecords: SelectedFeeRecordDetails[]): CurrencyAndAmount => ({
  currency: feeRecords[0]?.reportedPayment.currency,
  amount: feeRecords.map((feeRecord) => feeRecord.reportedPayment.amount).reduce((total, currentAmount) => total + currentAmount, 0),
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

  const selectedFeeRecordDetails = selectedFeeRecordEntities.map((feeRecordEntity) => mapFeeRecordEntityToSelectedFeeRecordDetails(feeRecordEntity));

  return {
    bank: { name: bankName },
    reportPeriod,
    totalReportedPayments: getTotalReportedPayments(selectedFeeRecordDetails),
    feeRecords: selectedFeeRecordDetails,
  };
};
