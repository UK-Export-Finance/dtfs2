import {
  Currency,
  CurrencyAndAmount,
  FeeRecordEntity,
  PaymentEntity,
  ReportPeriod,
  SelectedFeeRecordDetails,
  SelectedFeeRecordsDetails,
  SelectedFeeRecordsPaymentDetails,
  SelectedFeeRecordsCompatiblePaymentGroups,
} from '@ukef/dtfs2-common';
import { getBankNameById } from '../../../../repositories/banks-repo';
import { NotFoundError } from '../../../../errors';
import { mapFeeRecordEntityToReportedFees, mapFeeRecordEntityToReportedPayments } from '../../../../mapping/fee-record-mapper';
import { PaymentRepo } from '../../../../repositories/payment-repo';
import { FeeRecordPaymentGroup } from '../../../../types/utilisation-reports';
import { getFeeRecordPaymentEntityGroupsFromFeeRecordEntities } from '../../../../helpers';
import { mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups } from '../get-utilisation-report-reconciliation-details-by-id.controller/helpers/map-fee-record-payment-entity-groups-to-fee-record-payment-groups';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';

const mapFeeRecordPaymentGroupsToSelectedFeeRecordsCompatiblePaymentGroups = (
  feeRecordPaymentGroups: FeeRecordPaymentGroup[] | undefined,
): SelectedFeeRecordsCompatiblePaymentGroups | undefined => {
  if (!feeRecordPaymentGroups) {
    return undefined;
  }

  return feeRecordPaymentGroups
    .filter((group) => group.paymentsReceived !== null && group.paymentsReceived.length > 0)
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

export const getExistingCompatibleFeeRecordPaymentGroups = async (reportId: string, paymentCurrency: Currency): Promise<FeeRecordPaymentGroup[]> => {
  const feeRecords = await FeeRecordRepo.findByReportIdAndPaymentCurrencyAndStatusDoesNotMatchWithPayments(Number(reportId), paymentCurrency);

  const feeRecordPaymentEntityGroups = getFeeRecordPaymentEntityGroupsFromFeeRecordEntities(feeRecords);
  return mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups(feeRecordPaymentEntityGroups);
};

export const mapToSelectedFeeRecordDetails = async (
  bankId: string,
  reportPeriod: ReportPeriod,
  selectedFeeRecordEntities: FeeRecordEntity[],
  canAddToExistingPayment: boolean,
  existingCompatibleFeeRecordPaymentGroups?: FeeRecordPaymentGroup[],
): Promise<SelectedFeeRecordsDetails> => {
  const bankName = await getBankNameById(bankId);
  if (!bankName) {
    throw new NotFoundError(`Failed to find a bank with id '${bankId}'`);
  }

  // On the premium payments tab it is only possible to select fee records with no linked payments or a single group of fee records all having the same linked payments
  const distinctPaymentsForFeeRecords = selectedFeeRecordEntities[0].payments;
  const recordedPaymentDetails = distinctPaymentsForFeeRecords.map((paymentEntity) => mapPaymentEntityToSelectedFeeRecordsPaymentDetails(paymentEntity));
  const selectedFeeRecordDetails = selectedFeeRecordEntities.map((feeRecordEntity) => mapFeeRecordEntityToSelectedFeeRecordDetails(feeRecordEntity));

  const mappedExistingCompatiblePaymentGroups = mapFeeRecordPaymentGroupsToSelectedFeeRecordsCompatiblePaymentGroups(existingCompatibleFeeRecordPaymentGroups);

  return {
    bank: { name: bankName },
    reportPeriod,
    totalReportedPayments: getTotalReportedPayments(selectedFeeRecordDetails),
    feeRecords: selectedFeeRecordDetails,
    payments: recordedPaymentDetails,
    canAddToExistingPayment,
    existingCompatiblePaymentGroups: mappedExistingCompatiblePaymentGroups,
  };
};
