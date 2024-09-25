import { UtilisationReportEntity, PremiumPaymentsFilters, PaymentDetailsFilters } from '@ukef/dtfs2-common';
import { NotFoundError } from '../../../../../errors';
import { getBankNameById } from '../../../../../repositories/banks-repo';
import { UtilisationReportReconciliationDetails } from '../../../../../types/utilisation-reports';
import {
  filterFeeRecordPaymentEntityGroupsByPremiumPaymentsFilters,
  filterFeeRecordPaymentEntityGroupsByPaymentDetailsFilters,
} from './filter-fee-record-payment-entity-groups';
import { mapToFeeRecordPaymentGroups } from './map-to-fee-record-payment-groups';
import { getFeeRecordPaymentEntityGroups } from '../../../../../helpers';
import { getKeyingSheetForReportId } from './get-keying-sheet-for-report-id';
import { FeeRecordPaymentEntityGroup } from '../../../../../types/fee-record-payment-entity-group';

/**
 * Filters premium payments based on provided filters.
 * If a facilityId is provided in the filters, it filters the fee record payment entity groups.
 * Otherwise, returns the original groups.
 * @param feeRecordPaymentEntityGroups - The fee record payment entity groups to filter
 * @param filters - The filters to be applied to the premium payments data
 * @param filters.facilityId - The facility ID filter
 * @returns A promise that resolves to the filtered fee record payment groups
 */
const filterPremiumPayments = async (feeRecordPaymentEntityGroups: FeeRecordPaymentEntityGroup[], filters: PremiumPaymentsFilters) => {
  const { facilityId } = filters;

  let feeRecords = feeRecordPaymentEntityGroups;

  if (facilityId) {
    feeRecords = filterFeeRecordPaymentEntityGroupsByPremiumPaymentsFilters(feeRecordPaymentEntityGroups, filters);
  }

  return await mapToFeeRecordPaymentGroups(feeRecords);
};

/**
 * Filters fee record payment entity groups based on provided filters.
 * Applies filters for payment currency, facility ID, and payment reference.
 * @param feeRecordPaymentEntityGroups - The fee record payment entity groups to filter
 * @param filters - The filters to be applied to the fee record payment data
 * @param filters.facilityId - The facility ID filter
 * @param filters.paymentCurrency - The payment currency filter
 * @param filters.paymentReference - The payment reference filter
 * @returns A promise that resolves to the filtered fee record payment groups
 */
const filterPaymentDetails = async (feeRecordPaymentEntityGroups: FeeRecordPaymentEntityGroup[], filters: PaymentDetailsFilters) => {
  const { facilityId, paymentCurrency, paymentReference } = filters;

  let feeRecords = feeRecordPaymentEntityGroups;

  if (facilityId || paymentCurrency || paymentReference) {
    feeRecords = filterFeeRecordPaymentEntityGroupsByPaymentDetailsFilters(feeRecordPaymentEntityGroups, filters);
  }

  return await mapToFeeRecordPaymentGroups(feeRecords);
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
  paymentDetailsFilters: PaymentDetailsFilters,
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

  const premiumPayments = await filterPremiumPayments(feeRecordPaymentEntityGroups, premiumPaymentsFilters);

  const paymentDetails = await filterPaymentDetails(feeRecordPaymentEntityGroups, paymentDetailsFilters);

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
