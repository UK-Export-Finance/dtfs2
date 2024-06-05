import { FeeRecordEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { FeeRecordItem, UtilisationReportReconciliationDetails } from '../../../../types/utilisation-reports';
import { getBankNameById } from '../../../../repositories/banks-repo';
import { NotFoundError } from '../../../../errors';
import { mapFeeRecordEntityToReportedFees, mapFeeRecordEntityToReportedPayments } from '../../../../mapping/fee-record-mapper';

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
    status: feeRecord.status,
    reportedFees,
    reportedPayments,
    totalReportedPayments,
    paymentsReceived: null,
    totalPaymentsReceived: null,
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
