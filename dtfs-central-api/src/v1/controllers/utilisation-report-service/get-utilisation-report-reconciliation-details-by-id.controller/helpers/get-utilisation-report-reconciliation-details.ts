import { UtilisationReportEntity, UtilisationReportPremiumPaymentsTabFilters } from '@ukef/dtfs2-common';
import { NotFoundError } from '../../../../../errors';
import { getBankNameById } from '../../../../../repositories/banks-repo';
import { UtilisationReportReconciliationDetails } from '../../../../../types/utilisation-reports';
import { filterFeeRecordPaymentEntityGroupsByFacilityId } from './filter-fee-record-payment-entity-groups-by-facility-id';
import { mapToFeeRecordPaymentGroups } from './map-to-fee-record-payment-groups';
import { getFeeRecordPaymentEntityGroups } from '../../../../../helpers';
import { getKeyingSheetForReportId } from './get-keying-sheet-for-report-id';

/**
 * Gets the utilisation report reconciliation details for the supplied report entity
 * @param utilisationReport - The utilisation report entity
 * @param premiumPaymentsTabFilters - The filters to be applied for the premium payments table
 * @param premiumPaymentsTabFilters.facilityId - The facility ID filter
 * @returns The utilisation report reconciliation details
 * @throws {Error} If the report has not been uploaded
 * @throws {NotFoundError} If a bank cannot be found with the matching bank id
 */
export const getUtilisationReportReconciliationDetails = async (
  utilisationReport: UtilisationReportEntity,
  premiumPaymentsTabFilters: UtilisationReportPremiumPaymentsTabFilters,
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

  const unfilteredFeeRecordPaymentGroups = await mapToFeeRecordPaymentGroups(feeRecordPaymentEntityGroups);

  const { facilityId } = premiumPaymentsTabFilters;
  const premiumPaymentsFeeRecordPaymentGroups = facilityId
    ? await mapToFeeRecordPaymentGroups(filterFeeRecordPaymentEntityGroupsByFacilityId(feeRecordPaymentEntityGroups, facilityId))
    : unfilteredFeeRecordPaymentGroups;

  return {
    reportId: id,
    bank: {
      id: bankId,
      name: bankName,
    },
    status,
    reportPeriod,
    dateUploaded,
    premiumPaymentsFeeRecordPaymentGroups,
    unfilteredFeeRecordPaymentGroups,
    keyingSheet,
  };
};
