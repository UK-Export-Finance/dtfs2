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
} from '@ukef/dtfs2-common';
import { getBankNameById } from '../../../../repositories/banks-repo';
import { NotFoundError } from '../../../../errors';
import { mapFeeRecordEntityToReportedFees, mapFeeRecordEntityToReportedPayments } from '../../../../mapping/fee-record-mapper';
import { PaymentRepo } from '../../../../repositories/payment-repo';
import { FeeRecordPaymentGroup } from '../../../../types/utilisation-reports';
import { getFeeRecordPaymentEntityGroupsFromFeeRecordEntities } from '../../../../helpers';
import { mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups } from '../get-utilisation-report-reconciliation-details-by-id.controller/helpers/map-fee-record-payment-entity-groups-to-fee-record-payment-groups';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';

const mapFeeRecordPaymentGroupsToSelectedFeeRecordsAvailablePaymentGroups = (
  feeRecordPaymentGroups: FeeRecordPaymentGroup[],
): SelectedFeeRecordsAvailablePaymentGroups => {
  return feeRecordPaymentGroups
    .filter((group) => group.paymentsReceived !== null)
    .map((group) =>
      group.paymentsReceived!.map((groupPayment) => ({
        id: groupPayment.id,
        amount: groupPayment.amount,
        currency: groupPayment.currency,
        reference: groupPayment.reference,
      })),
    );
};

const mapPaymentEntityToSelectedFeeRecordsPaymentDetails = (paymentEntity: PaymentEntity): SelectedFeeRecordsPaymentDetails => ({
  amount: paymentEntity.amount,
  currency: paymentEntity.currency,
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

export const canFeeRecordsBeAddedToExistingPayment = async (reportId: string, feeRecords: FeeRecordEntity[]): Promise<boolean> => {
  if (feeRecords.length === 0) {
    return false;
  }

  const anyFeeRecordDoesNotHaveStatusToDo = feeRecords.some((record) => record.status !== 'TO_DO');
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

  const feeRecordPaymentEntityGroups = getFeeRecordPaymentEntityGroupsFromFeeRecordEntities(feeRecordEntities);
  const feeRecordPaymentGroups = mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups(feeRecordPaymentEntityGroups);

  return mapFeeRecordPaymentGroupsToSelectedFeeRecordsAvailablePaymentGroups(feeRecordPaymentGroups);
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
  const recordedPaymentDetails = distinctPaymentsForFeeRecords.map((paymentEntity) => mapPaymentEntityToSelectedFeeRecordsPaymentDetails(paymentEntity));
  const selectedFeeRecordDetails = selectedFeeRecordEntities.map((feeRecordEntity) => mapFeeRecordEntityToSelectedFeeRecordDetails(feeRecordEntity));

  return {
    bank: { name: bankName },
    reportPeriod,
    totalReportedPayments: getTotalReportedPayments(selectedFeeRecordDetails),
    feeRecords: selectedFeeRecordDetails,
    payments: recordedPaymentDetails,
    canAddToExistingPayment,
  };
};
