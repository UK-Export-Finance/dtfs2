import { CurrencyAndAmount, FeeRecordEntity, UtilisationReportEntity, applyExchangeRateToAmount } from '@ukef/dtfs2-common';
import { FeeRecordItem, UtilisationReportReconciliationDetails } from '../../../../types/utilisation-reports';
import { getBankNameById } from '../../../../repositories/banks-repo';
import { NotFoundError } from '../../../../errors';

/**
 * Maps the fee record entity to an object with the following properties:
 * - `reportedFees` - the fees paid to UKEF for the period in the actual payment currency
 * - `reportedPayments` - the fees paid to UKEF converted to the payment currency
 * - `totalReportedPayments` - the total reported fees in the payment currency
 * - `paymentsReceived` - the payments added in TFM
 * - `totalPaymentsReceived` - the total of the above
 * - `status` - the status of the fee record
 * @param feeRecord - The fee record entity
 * @returns The mapped fee record
 */
export const mapFeeRecordEntityToReconciliationDetailsFeeRecordItem = (feeRecord: FeeRecordEntity): FeeRecordItem => {
  const reportedFees: CurrencyAndAmount = {
    currency: feeRecord.feesPaidToUkefForThePeriodCurrency,
    amount: feeRecord.feesPaidToUkefForThePeriod,
  };

  const reportedPayments: CurrencyAndAmount = {
    currency: feeRecord.paymentCurrency,
    amount:
      feeRecord.paymentCurrency === feeRecord.feesPaidToUkefForThePeriodCurrency
        ? feeRecord.feesPaidToUkefForThePeriod
        : applyExchangeRateToAmount(feeRecord.feesPaidToUkefForThePeriod, feeRecord.paymentExchangeRate, 'divide', 2),
  };

  const totalReportedPayments = reportedPayments;

  return {
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
 * Maps the utilisation report entity to the reconciliation item
 * @param utilisationReport - The utilisation report
 * @returns The summary item
 * @throws {Error} If a bank cannot be found with the matching bank id
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
