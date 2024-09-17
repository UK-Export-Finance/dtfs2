import { UtilisationReportEntity, PremiumPaymentsFilters } from '@ukef/dtfs2-common';
import { NotFoundError } from '../../../../../errors';
import { getBankNameById } from '../../../../../repositories/banks-repo';
import { FeeRecordPaymentGroup, UtilisationReportReconciliationDetails } from '../../../../../types/utilisation-reports';
import { filterFeeRecordPaymentEntityGroupsByFacilityId } from './filter-fee-record-payment-entity-groups-by-facility-id';
import { mapToFeeRecordPaymentGroups } from './map-to-fee-record-payment-groups';
import { getFeeRecordPaymentEntityGroups } from '../../../../../helpers';
import { getKeyingSheetForReportId } from './get-keying-sheet-for-report-id';
import { FeeRecordPaymentEntityGroup } from '../../../../../types/fee-record-payment-entity-group';

/**
 * Filters premium payments based on provided filters.
 * If a facilityId is provided in the filters, it filters the fee record payment entity groups
 * and maps them to fee record payment groups. Otherwise, it returns the unfiltered groups.
 * @param feeRecordPaymentEntityGroups - The fee record payment entity groups to filter
 * @param unfilteredFeeRecordPaymentGroups - The unfiltered fee record payment groups
 * @param filters - The filters to be applied to the premium payments data
 * @param filters.facilityId - The facility ID filter
 * @returns A promise that resolves to the filtered or unfiltered fee record payment groups
 */
const filterPremiumPayments = async (
  feeRecordPaymentEntityGroups: FeeRecordPaymentEntityGroup[],
  unfilteredFeeRecordPaymentGroups: FeeRecordPaymentGroup[],
  filters: PremiumPaymentsFilters,
) => {
  const { facilityId } = filters;

  if (facilityId) {
    const filteredFeeRecords = filterFeeRecordPaymentEntityGroupsByFacilityId(feeRecordPaymentEntityGroups, facilityId);

    return await mapToFeeRecordPaymentGroups(filteredFeeRecords);
  }

  return unfilteredFeeRecordPaymentGroups;
};

/**
 * Gets the utilisation report reconciliation details for the supplied report entity
 * @param utilisationReport - The utilisation report entity
 * @param premiumPaymentsFilters - The filters to be applied for the premium payments table
 * @param premiumPaymentsFilters.facilityId - The facility ID filter
 * @returns The utilisation report reconciliation details
 * @throws {Error} If the report has not been uploaded
 * @throws {NotFoundError} If a bank cannot be found with the matching bank id
 */
export const getUtilisationReportReconciliationDetails = async (
  utilisationReport: UtilisationReportEntity,
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

  const feeRecordPaymentGroups = await mapToFeeRecordPaymentGroups(feeRecordPaymentEntityGroups);

  const premiumPayments = await filterPremiumPayments(feeRecordPaymentEntityGroups, feeRecordPaymentGroups, premiumPaymentsFilters);

  const paymentDetails = feeRecordPaymentGroups;


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
