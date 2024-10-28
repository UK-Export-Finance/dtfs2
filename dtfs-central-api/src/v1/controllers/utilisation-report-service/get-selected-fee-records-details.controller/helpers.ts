import {
  Currency,
  CurrencyAndAmount,
  FeeRecordEntity,
  PaymentEntity,
  ReportPeriod,
  SelectedFeeRecordDetails,
  SelectedFeeRecordsDetails,
  SelectedFeeRecordsPaymentDetails,
  SelectedFeeRecordsAvailablePaymentGroups,
  FEE_RECORD_STATUS,
} from '@ukef/dtfs2-common';
import { getBankNameById } from '../../../../repositories/banks-repo';
import { NotFoundError } from '../../../../errors';
import { mapFeeRecordEntityToReportedFees, mapFeeRecordEntityToReportedPayments } from '../../../../mapping/fee-record-mapper';
import { PaymentRepo } from '../../../../repositories/payment-repo';
import { getFeeRecordPaymentEntityGroups } from '../../../../helpers';
import { FeeRecordPaymentEntityGroup } from '../../../../types/fee-record-payment-entity-group';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';

/**
 * Maps the fee record payment entity groups to the selected
 * fee records available payment groups
 * @param feeRecordPaymentGroups - The fee record payment entity groups
 * @returns The selected fee records available payment groups
 */
const mapToSelectedFeeRecordsAvailablePaymentGroups = (feeRecordPaymentGroups: FeeRecordPaymentEntityGroup[]): SelectedFeeRecordsAvailablePaymentGroups => {
  return feeRecordPaymentGroups
    .filter((group) => group.payments.length !== 0)
    .map((group) =>
      group.payments.map((groupPayment) => ({
        id: groupPayment.id,
        amount: groupPayment.amount,
        currency: groupPayment.currency,
        reference: groupPayment.reference,
      })),
    );
};

/**
 * Maps the payment entity to the selected fee records
 * payment details
 * @param paymentEntity - The payment entity
 * @returns The selected fee records payment details
 */
const mapToSelectedFeeRecordsPaymentDetails = (paymentEntity: PaymentEntity): SelectedFeeRecordsPaymentDetails => ({
  amount: paymentEntity.amount,
  currency: paymentEntity.currency,
  reference: paymentEntity.reference,
  dateReceived: paymentEntity.dateReceived,
});

/**
 * Maps the fee record entity to the selected
 * fee record details
 * @param feeRecordEntity - The fee record entity
 * @returns The selected fee record details
 */
const mapToSelectedFeeRecordDetails = (feeRecordEntity: FeeRecordEntity): SelectedFeeRecordDetails => ({
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

export const canFeeRecordsBeAddedToExistingPayment = async (reportId: string, feeRecords: FeeRecordEntity[]): Promise<boolean> => {
  if (feeRecords.length === 0) {
    return false;
  }

  const anyFeeRecordDoesNotHaveStatusToDo = feeRecords.some((record) => record.status !== FEE_RECORD_STATUS.TO_DO);
  if (anyFeeRecordDoesNotHaveStatusToDo) {
    return false;
  }

  const reportedPaymentCurrency = feeRecords[0].paymentCurrency;
  return await PaymentRepo.existsUnmatchedPaymentOfCurrencyForReportWithId(Number(reportId), reportedPaymentCurrency);
};

/**
 * Gets the available payment groups for the selected fee records
 * @param reportId - The report id
 * @param paymentCurrency - The payment currency
 * @returns The selected fee records available payment groups
 */
export const getSelectedFeeRecordsAvailablePaymentGroups = async (
  reportId: string,
  paymentCurrency: Currency,
): Promise<SelectedFeeRecordsAvailablePaymentGroups> => {
  const feeRecordEntities = await FeeRecordRepo.findByReportIdAndPaymentCurrencyAndStatusDoesNotMatchWithPayments(Number(reportId), paymentCurrency);

  const feeRecordPaymentEntityGroups = getFeeRecordPaymentEntityGroups(feeRecordEntities);
  return mapToSelectedFeeRecordsAvailablePaymentGroups(feeRecordPaymentEntityGroups);
};

/**
 * Maps selected fee record entities to SelectedFeeRecordsDetails without available payment groups
 * @param bankId - The bank id
 * @param reportPeriod - The report period
 * @param selectedFeeRecordEntities - The selected fee record entities
 * @param canAddToExistingPayment - Whether fee records can be added to existing payment
 * @returns The mapped selected fee records details
 */
export const mapToSelectedFeeRecordDetailsWithoutAvailablePaymentGroups = async (
  bankId: string,
  reportPeriod: ReportPeriod,
  selectedFeeRecordEntities: FeeRecordEntity[],
  canAddToExistingPayment: boolean,
): Promise<SelectedFeeRecordsDetails> => {
  const bankName = await getBankNameById(bankId);
  if (!bankName) {
    throw new NotFoundError(`Failed to find a bank with id '${bankId}'`);
  }

  // On the premium payments tab it is only possible to select fee records with no linked payments or a single group of fee records all having the same linked payments
  const distinctPaymentsForFeeRecords = selectedFeeRecordEntities[0].payments;
  const recordedPaymentDetails = distinctPaymentsForFeeRecords.map(mapToSelectedFeeRecordsPaymentDetails);
  const selectedFeeRecordDetails = selectedFeeRecordEntities.map(mapToSelectedFeeRecordDetails);

  return {
    bank: { name: bankName },
    reportPeriod,
    totalReportedPayments: getTotalReportedPayments(selectedFeeRecordDetails),
    feeRecords: selectedFeeRecordDetails,
    payments: recordedPaymentDetails,
    canAddToExistingPayment,
  };
};
