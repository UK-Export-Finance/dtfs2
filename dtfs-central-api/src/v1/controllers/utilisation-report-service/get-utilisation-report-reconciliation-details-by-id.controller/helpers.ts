import { FeeRecordEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { FeeRecordPaymentGroup, UtilisationReportReconciliationDetails } from '../../../../types/utilisation-reports';
import { getBankNameById } from '../../../../repositories/banks-repo';
import { NotFoundError } from '../../../../errors';
import { mapFeeRecordEntityToFeeRecord } from '../../../../mapping/fee-record-mapper';
import { mapPaymentEntityToPayment } from '../../../../mapping/payment-mapper';
import {
  FeeRecordPaymentEntityGroup,
  calculateTotalCurrencyAndAmount,
  getCompleteFeeRecordPaymentEntityGroupsFromFilteredFeeRecordEntities,
  getFeeRecordPaymentEntityGroupsFromFeeRecordEntities,
} from '../../../../helpers';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';

const mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups = (feeRecordPaymentEntityGroups: FeeRecordPaymentEntityGroup[]): FeeRecordPaymentGroup[] => {
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
 * @param feeRecordGroupingFunction - The method that should be called to create the fee record payment groups
 * @returns The utilisation report reconciliation details
 * @throws {Error} If the report has not been uploaded
 * @throws {NotFoundError} If a bank cannot be found with the matching bank id
 */
const mapUtilisationReportEntityToReconciliationDetails = async (
  utilisationReport: UtilisationReportEntity,
  feeRecordGroupingFunction: (feeRecords: FeeRecordEntity[]) => FeeRecordPaymentEntityGroup[],
): Promise<UtilisationReportReconciliationDetails> => {
  const { id, bankId, feeRecords, dateUploaded, status, reportPeriod } = utilisationReport;

  if (!dateUploaded) {
    throw new Error(`Report with id '${id}' has not been uploaded`);
  }

  const bankName = await getBankNameById(bankId);
  if (!bankName) {
    throw new NotFoundError(`Failed to find a bank with id '${bankId}'`);
  }

  const feeRecordPaymentEntityGroups = feeRecordGroupingFunction(feeRecords);
  const feeRecordPaymentGroups = mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups(feeRecordPaymentEntityGroups);

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

const getUtilisationReportReconciliationDetailsFilteredByPartialFacilityId = async (
  reportId: number,
  facilityIdQuery: string,
): Promise<UtilisationReportReconciliationDetails> => {
  const utilisationReportWithFilteredFeeRecords = await UtilisationReportRepo.findOneByIdWithFeeRecordsFilteredByPartialFacilityId(reportId, facilityIdQuery);

  if (!utilisationReportWithFilteredFeeRecords) {
    throw new NotFoundError(`Failed to find a report with id '${reportId}'`);
  }

  return await mapUtilisationReportEntityToReconciliationDetails(
    utilisationReportWithFilteredFeeRecords,
    getCompleteFeeRecordPaymentEntityGroupsFromFilteredFeeRecordEntities,
  );
};

const getUtilisationReportReconciliationDetailsWithoutFiltering = async (reportId: number): Promise<UtilisationReportReconciliationDetails> => {
  const utilisationReport = await UtilisationReportRepo.findOneByIdWithFeeRecordsWithPayments(reportId);

  if (!utilisationReport) {
    throw new NotFoundError(`Failed to find a report with id '${reportId}'`);
  }

  return await mapUtilisationReportEntityToReconciliationDetails(utilisationReport, getFeeRecordPaymentEntityGroupsFromFeeRecordEntities);
};

export const getUtilisationReportReconciliationDetails = async (
  reportId: number,
  facilityIdQuery?: string,
): Promise<UtilisationReportReconciliationDetails> => {
  return facilityIdQuery
    ? await getUtilisationReportReconciliationDetailsFilteredByPartialFacilityId(reportId, facilityIdQuery)
    : await getUtilisationReportReconciliationDetailsWithoutFiltering(reportId);
};
