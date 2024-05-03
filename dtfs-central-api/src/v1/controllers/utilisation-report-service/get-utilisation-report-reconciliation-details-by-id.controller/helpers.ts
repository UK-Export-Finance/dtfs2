import {
  CurrencyAndAmount,
  FeeRecordEntity,
  UtilisationReportEntity,
  divideAmountByExchangeRate,
} from '@ukef/dtfs2-common';
import { FeeRecordItem, UtilisationReportReconciliationDetails } from '../../../../types/utilisation-reports';
import { getBankNameById } from '../../../../repositories/banks-repo';
import { NotFoundError } from '../../../../errors';

/**
 * Maps the fee record entity to the reported fees
 * @param feeRecord - The fee record entity
 * @returns The reported fees
 */
const mapFeeRecordEntityToReportedFees = (feeRecord: FeeRecordEntity): CurrencyAndAmount => ({
  currency: feeRecord.feesPaidToUkefForThePeriodCurrency,
  amount: feeRecord.feesPaidToUkefForThePeriod,
});

/**
 * Maps the fee record entity to the reported payments
 * @param feeRecord - The fee record entity
 * @returns The reported fees
 */
const mapFeeRecordEntityToReportedPayments = (feeRecord: FeeRecordEntity): CurrencyAndAmount => {
  const { paymentCurrency, feesPaidToUkefForThePeriodCurrency, feesPaidToUkefForThePeriod, paymentExchangeRate } =
    feeRecord;

  if (paymentCurrency === feesPaidToUkefForThePeriodCurrency) {
    return {
      currency: paymentCurrency,
      amount: feesPaidToUkefForThePeriod,
    };
  }

  const feesPaidToUkefForThePeriodInPaymentCurrency = divideAmountByExchangeRate(
    feesPaidToUkefForThePeriod,
    paymentExchangeRate,
    2,
  );

  return {
    amount: feesPaidToUkefForThePeriodInPaymentCurrency,
    currency: paymentCurrency,
  };
};

/**
 * Maps a fee record entity to a fee record item
 * @param feeRecord - The fee record entity
 * @returns The mapped fee record
 */
export const mapFeeRecordEntityToReconciliationDetailsFeeRecordItem = (feeRecord: FeeRecordEntity): FeeRecordItem => {
  const reportedFees = mapFeeRecordEntityToReportedFees(feeRecord);
  const reportedPayments = mapFeeRecordEntityToReportedPayments(feeRecord);

  const totalReportedPayments = reportedPayments;

  return {
    id: feeRecord.id,
    facilityId: feeRecord.facilityId,
    exporter: feeRecord.exporter,
    reportedFees,
    reportedPayments,
    totalReportedPayments,
    paymentsReceived: null,
    totalPaymentsReceived: null,
    status: 'TO_DO',
  };
};

/**
 * Maps the utilisation report entity to the reconciliation details
 * @param utilisationReport - The utilisation report entity
 * @returns The utilisation report reconciliation details
 * @throws {Error} If the report has not been uploaded
 * @throws {NotFoundError} If a bank cannot be found with the matching bank id
 */
export const mapUtilisationReportEntityToReconciliationDetails = async (
  utilisationReport: UtilisationReportEntity,
): Promise<UtilisationReportReconciliationDetails> => {
  const { id, bankId, feeRecords, dateUploaded, status, reportPeriod } = utilisationReport;

  if (!dateUploaded) {
    throw new Error(`Report with id '${id}' has not been uploaded`);
  }

  const bankName = await getBankNameById(bankId);
  if (!bankName) {
    throw new NotFoundError(`Failed to find a bank with id '${bankId}'`);
  }

  const mappedFeeRecords = feeRecords.map(mapFeeRecordEntityToReconciliationDetailsFeeRecordItem);

  return {
    reportId: id,
    bank: {
      id: bankId,
      name: bankName,
    },
    status,
    reportPeriod,
    dateUploaded,
    feeRecords: mappedFeeRecords,
  };
};
