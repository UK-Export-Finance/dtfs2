import { UtilisationReportEntity } from '@ukef/dtfs2-common';
import { NotFoundError } from '../../../../../errors';
import { getBankNameById } from '../../../../../repositories/banks-repo';
import { UtilisationReportReconciliationDetails } from '../../../../../types/utilisation-reports';
import { mapFeeRecordEntitiesToKeyingSheet } from '../../../../../mapping/fee-record-mapper';
import { getFilteredFeeRecordPaymentEntityGroups } from './get-filtered-fee-record-payment-entity-groups';
import { mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups } from './map-fee-record-payment-entity-groups-to-fee-record-payment-groups';

/**
 * Gets the utilisation report reconciliation details for the supplied report entity
 * @param utilisationReport - The utilisation report entity
 * @param facilityIdFilter - The facility id filter to be applied for the premium payments table
 * @returns The utilisation report reconciliation details
 * @throws {Error} If the report has not been uploaded
 * @throws {NotFoundError} If a bank cannot be found with the matching bank id
 */
export const getUtilisationReportReconciliationDetails = async (
  utilisationReport: UtilisationReportEntity,
  facilityIdFilter: string | undefined,
): Promise<UtilisationReportReconciliationDetails> => {
  const { id, bankId, feeRecords, dateUploaded, status, reportPeriod } = utilisationReport;

  if (!dateUploaded) {
    throw new Error(`Report with id '${id}' has not been uploaded`);
  }

  const bankName = await getBankNameById(bankId);
  if (!bankName) {
    throw new NotFoundError(`Failed to find a bank with id '${bankId}'`);
  }

  const feeRecordPaymentEntityGroups = getFilteredFeeRecordPaymentEntityGroups(feeRecords, facilityIdFilter);
  const feeRecordPaymentGroups = mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups(feeRecordPaymentEntityGroups);

  const keyingSheet = mapFeeRecordEntitiesToKeyingSheet(feeRecords);

  return {
    reportId: id,
    bank: {
      id: bankId,
      name: bankName,
    },
    status,
    reportPeriod,
    dateUploaded,
    feeRecordPaymentGroups,
    keyingSheet,
  };
};
