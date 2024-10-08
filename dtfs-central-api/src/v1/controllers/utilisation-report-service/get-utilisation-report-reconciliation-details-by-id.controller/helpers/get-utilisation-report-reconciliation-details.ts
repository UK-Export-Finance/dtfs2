import { UtilisationReportEntity, PremiumPaymentsFilters, ValidatedPaymentDetailsFilters } from '@ukef/dtfs2-common';
import { NotFoundError } from '../../../../../errors';
import { getBankNameById } from '../../../../../repositories/banks-repo';
import { UtilisationReportReconciliationDetails } from '../../../../../types/utilisation-reports';
import { filterFeeRecordPaymentEntityGroups } from './filter-fee-record-payment-entity-groups';
import { mapToPremiumPaymentsGroups } from './map-to-premium-payments-groups';
import { getFeeRecordPaymentEntityGroups } from '../../../../../helpers';
import { getKeyingSheetForReportId } from './get-keying-sheet-for-report-id';
import { FeeRecordPaymentEntityGroup } from '../../../../../types/fee-record-payment-entity-group';
import { mapToPaymentDetails } from './map-to-payment-details';

/**
 * Gets premium payment fee record payment groups based on provided filters.
 * @param feeRecordPaymentEntityGroups - The fee record payment entity groups to filter
 * @param filters - The filters to be applied to the premium payments data
 * @param filters.facilityId - The facility ID filter
 * @returns If a facilityId is provided in the filters, it filters the fee
 * record payment entity groups. Otherwise, returns the original groups.
 */
export const getPremiumPayments = (feeRecordPaymentEntityGroups: FeeRecordPaymentEntityGroup[], filters: PremiumPaymentsFilters) => {
  const { facilityId } = filters;

  let feeRecords = feeRecordPaymentEntityGroups;

  if (facilityId) {
    feeRecords = filterFeeRecordPaymentEntityGroups(feeRecordPaymentEntityGroups, filters);
  }

  return mapToPremiumPaymentsGroups(feeRecords);
};

/**
 * Gets payment details based on provided filters.
 * Applies filters for payment currency, facility ID, and payment reference.
 * @param feeRecordPaymentEntityGroups - The fee record payment entity groups to filter
 * @param filters - The filters to be applied to the fee record payment data
 * @param filters.facilityId - The facility ID filter
 * @param filters.paymentCurrency - The payment currency filter
 * @param filters.paymentReference - The payment reference filter
 * @returns A promise that resolves to an array of payment details objects.
 */
export const getPaymentDetails = async (feeRecordPaymentEntityGroups: FeeRecordPaymentEntityGroup[], filters: ValidatedPaymentDetailsFilters) => {
  const { facilityId: facilityIdFilter, paymentCurrency: paymentCurrencyFilter, paymentReference: paymentReferenceFilter } = filters;

  let feeRecords = feeRecordPaymentEntityGroups;

  if (facilityIdFilter || paymentCurrencyFilter || paymentReferenceFilter) {
    // Flatten groups to apply filters to individual payments rather than entire groups.
    const paymentsWithFeeRecords = feeRecords.flatMap((group) =>
      group.payments.map((payment) => ({
        payments: [payment],
        feeRecords: group.feeRecords,
      })),
    );

    feeRecords = filterFeeRecordPaymentEntityGroups(paymentsWithFeeRecords, filters);
  }

  return await mapToPaymentDetails(feeRecords);
};

/**
 * Gets the utilisation report reconciliation details for the supplied report entity
 * @param utilisationReport - The utilisation report entity
 * @param paymentDetailsFilters - The filters to be applied to the fee record payment data
 * @param paymentDetailsFilters.facilityId - The facility ID filter
 * @param paymentDetailsFilters.paymentCurrency - The payment currency filter
 * @param paymentDetailsFilters.paymentReference - The payment reference filter
 * @param premiumPaymentsFilters - The filters to be applied for the premium payments table
 * @param premiumPaymentsFilters.facilityId - The facility ID filter
 * @returns The utilisation report reconciliation details
 * @throws {Error} If the report has not been uploaded
 * @throws {NotFoundError} If a bank cannot be found with the matching bank id
 */
export const getUtilisationReportReconciliationDetails = async (
  utilisationReport: UtilisationReportEntity,
  paymentDetailsFilters: ValidatedPaymentDetailsFilters,
  premiumPaymentsFilters: PremiumPaymentsFilters,
): Promise<UtilisationReportReconciliationDetails> => {
  const { id, bankId, feeRecords, dateUploaded, status, reportPeriod } = utilisationReport;

  if (!dateUploaded) {
    throw new Error(`Report with id '${id}' has not been uploaded`);
  }

  const bankName = await getBankNameById(bankId);
  if (!bankName) {
    throw new NotFoundError(`Failed to find a bank with id '${bankId}'`);
  }

  const keyingSheet = await getKeyingSheetForReportId(utilisationReport.id, feeRecords);

  const feeRecordPaymentEntityGroups = getFeeRecordPaymentEntityGroups(feeRecords);

  const premiumPayments = getPremiumPayments(feeRecordPaymentEntityGroups, premiumPaymentsFilters);

  const paymentDetails = await getPaymentDetails(feeRecordPaymentEntityGroups, paymentDetailsFilters);

  return {
    reportId: id,
    bank: {
      id: bankId,
      name: bankName,
    },
    status,
    reportPeriod,
    dateUploaded,
    premiumPayments,
    paymentDetails,
    keyingSheet,
  };
};
