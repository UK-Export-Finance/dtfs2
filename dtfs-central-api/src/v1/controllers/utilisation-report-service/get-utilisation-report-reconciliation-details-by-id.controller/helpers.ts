import { FeeRecordEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { FeeRecordPaymentGroup, UtilisationReportReconciliationDetails } from '../../../../types/utilisation-reports';
import { FeeRecord } from '../../../../types/fee-records';
import { getBankNameById } from '../../../../repositories/banks-repo';
import { NotFoundError } from '../../../../errors';
import { mapFeeRecordEntityToReportedFees, mapFeeRecordEntityToReportedPayments } from '../../../../mapping/fee-record-mapper';
import { mapPaymentEntityToPayment } from '../../../../mapping/payment-mapper';
import { calculateTotalCurrencyAndAmount, getFeeRecordPaymentEntityGroupsFromFilteredFeeRecordEntities } from '../../../../helpers';

const mapFeeRecordEntityToFeeRecord = (feeRecord: FeeRecordEntity): FeeRecord => ({
  id: feeRecord.id,
  facilityId: feeRecord.facilityId,
  exporter: feeRecord.exporter,
  reportedFees: mapFeeRecordEntityToReportedFees(feeRecord),
  reportedPayments: mapFeeRecordEntityToReportedPayments(feeRecord),
});

const mapFeeRecordEntitiesToFeeRecordPaymentGroups = (feeRecordEntities: FeeRecordEntity[]): FeeRecordPaymentGroup[] => {
  const feeRecordPaymentEntityGroups = getFeeRecordPaymentEntityGroupsFromFilteredFeeRecordEntities(feeRecordEntities);

  return feeRecordPaymentEntityGroups.map(({ feeRecords: feeRecordEntitiesInGroup, payments }) => {
    const { status } = feeRecordEntitiesInGroup[0];

    if (payments.length === 0) {
      // If there are no payments, there is only one fee record in the group
      const feeRecord = mapFeeRecordEntityToFeeRecord(feeRecordEntitiesInGroup[0]);
      const totalReportedPayments = feeRecord.reportedPayments;

      return {
        feeRecords: [feeRecord],
        totalReportedPayments,
        paymentsReceived: null,
        totalPaymentsReceived: null,
        status,
      };
    }

    const feeRecords = feeRecordEntitiesInGroup.map(mapFeeRecordEntityToFeeRecord);

    const allReportedPayments = feeRecords.map(({ reportedPayments }) => reportedPayments);
    const totalReportedPayments = calculateTotalCurrencyAndAmount(allReportedPayments);

    const paymentsReceived = payments.map(mapPaymentEntityToPayment);
    const totalPaymentsReceived = calculateTotalCurrencyAndAmount(paymentsReceived);

    return {
      feeRecords,
      totalReportedPayments,
      paymentsReceived,
      totalPaymentsReceived,
      status,
    };
  });
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

  const feeRecordPaymentGroups = mapFeeRecordEntitiesToFeeRecordPaymentGroups(feeRecords);

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
  };
};
