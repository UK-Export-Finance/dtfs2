import { FeeRecordEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { FeeRecordItem, FeeRecordPaymentGroup, UtilisationReportReconciliationDetails } from '../../../../types/utilisation-reports';
import { getBankNameById } from '../../../../repositories/banks-repo';
import { NotFoundError } from '../../../../errors';
import { mapFeeRecordEntityToReportedFees, mapFeeRecordEntityToReportedPayments } from '../../../../mapping/fee-record-mapper';
import { mapPaymentEntityToPayment } from '../../../../mapping/payment-mapper';
import { calculateTotalCurrencyAndAmount, getFeeRecordPaymentEntityGroupsFromFeeRecordEntities } from '../../../../helpers';

const mapFeeRecordEntityToFeeRecordItem = (feeRecord: FeeRecordEntity): FeeRecordItem => ({
  id: feeRecord.id,
  facilityId: feeRecord.facilityId,
  exporter: feeRecord.exporter,
  reportedFees: mapFeeRecordEntityToReportedFees(feeRecord),
  reportedPayments: mapFeeRecordEntityToReportedPayments(feeRecord),
});

const mapFeeRecordEntitiesToFeeRecordPaymentGroups = (feeRecordEntities: FeeRecordEntity[]): FeeRecordPaymentGroup[] => {
  const feeRecordPaymentEntityGroups = getFeeRecordPaymentEntityGroupsFromFeeRecordEntities(feeRecordEntities);

  return feeRecordPaymentEntityGroups.map(({ feeRecords, payments }) => {
    const { status } = feeRecords[0];

    if (payments.length === 0) {
      // If there are no payments, there is only one fee record in the group
      const feeRecordItem = mapFeeRecordEntityToFeeRecordItem(feeRecords[0]);
      const totalReportedPayments = feeRecordItem.reportedPayments;

      return {
        feeRecords: [feeRecordItem],
        totalReportedPayments,
        paymentsReceived: null,
        totalPaymentsReceived: null,
        status,
      };
    }

    const feeRecordItems = feeRecords.map(mapFeeRecordEntityToFeeRecordItem);

    const allReportedPayments = feeRecordItems.map(({ reportedPayments }) => reportedPayments);
    const totalReportedPayments = calculateTotalCurrencyAndAmount(allReportedPayments);

    const paymentsReceived = payments.map(mapPaymentEntityToPayment);
    const totalPaymentsReceived = calculateTotalCurrencyAndAmount(paymentsReceived);

    return {
      feeRecords: feeRecordItems,
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
