import { orderBy } from 'lodash';
import { FEE_RECORD_STATUS, FeeRecordEntity, FeeRecordStatus } from '@ukef/dtfs2-common';
import { FeeRecordPaymentEntityGroup, calculateTotalCurrencyAndAmount } from '../../../../../helpers';
import { mapPaymentEntityToPayment } from '../../../../../mapping/payment-mapper';
import { mapFeeRecordEntityToFeeRecord } from '../../../../../mapping/fee-record-mapper';
import { FeeRecordPaymentGroup, FeeRecordReconciledByUser } from '../../../../../types/utilisation-reports';
import { TfmUsersRepo } from '../../../../../repositories/tfm-users-repo';

/**
 * Gets the status for a fee record payment entity group
 * @param feeRecordEntitiesInGroup - The fee record entities in a group
 * @returns The status of the group
 */
const getStatusForGroupOfFeeRecords = (feeRecordEntitiesInGroup: FeeRecordEntity[]): FeeRecordStatus => {
  if (feeRecordEntitiesInGroup.some((feeRecordEntity) => feeRecordEntity.status === 'READY_TO_KEY')) {
    return 'READY_TO_KEY';
  }
  return feeRecordEntitiesInGroup[0].status;
};

/**
 * Gets the most recently reconciled fee record from a list of fee records
 * @param feeRecordsAtReconciledStatus - The fee records (with status RECONCILED)
 * @returns The most recently reconciled fee record
 */
const getMostRecentlyReconciledFeeRecord = (feeRecordsAtReconciledStatus: FeeRecordEntity[]): FeeRecordEntity => {
  if (feeRecordsAtReconciledStatus.some((feeRecord) => feeRecord.dateReconciled === null)) {
    throw new Error('Expected list of fee records at RECONCILED status to all have a non-null date reconciled');
  }
  const feeRecordsSortedByDateReconciledDescending = orderBy(feeRecordsAtReconciledStatus, [(feeRecord) => feeRecord.dateReconciled!.getTime()], ['desc']);
  return feeRecordsSortedByDateReconciledDescending[0];
};

/**
 * Gets the reconciled by user for a fee record
 * @param feeRecord - The fee record
 * @returns The reconciled by user
 */
const getReconciledByUserForFeeRecord = async (feeRecord: FeeRecordEntity): Promise<FeeRecordReconciledByUser | null> => {
  if (feeRecord.reconciledByUserId === null) {
    return null;
  }
  const user = await TfmUsersRepo.findOneUserById(feeRecord.reconciledByUserId);
  if (!user) {
    console.info("Find to find the TFM user with id '%s' who reconciled a fee record payment group", feeRecord.reconciledByUserId);
    return null;
  }
  return {
    firstName: user.firstName,
    lastName: user.lastName,
  };
};

/**
 * Gets the reconciliation data for the fee records in the group
 * @param feeRecords - The fee records in the group
 * @param groupStatus - The status of the fee record payment group
 * @returns The reconciliation data
 */
const getReconciliationDataForFeeRecords = async (
  feeRecords: FeeRecordEntity[],
  groupStatus: FeeRecordStatus,
): Promise<{ reconciledByUser: FeeRecordReconciledByUser | null; dateReconciled: Date | null }> => {
  if (groupStatus !== FEE_RECORD_STATUS.RECONCILED) {
    return { reconciledByUser: null, dateReconciled: null };
  }

  const mostRecentlyReconciledFeeRecord = getMostRecentlyReconciledFeeRecord(feeRecords);
  const reconciledByUser = await getReconciledByUserForFeeRecord(mostRecentlyReconciledFeeRecord);
  return {
    reconciledByUser,
    dateReconciled: mostRecentlyReconciledFeeRecord.dateReconciled,
  };
};

/**
 * Maps the fee record payment entity groups to the fee record payment groups
 * @param feeRecordPaymentEntityGroups - The fee record payment entity groups
 * @returns The fee record payment groups
 */
export const mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups = async (
  feeRecordPaymentEntityGroups: FeeRecordPaymentEntityGroup[],
): Promise<FeeRecordPaymentGroup[]> =>
  await Promise.all(
    feeRecordPaymentEntityGroups.map(async ({ feeRecords: feeRecordEntitiesInGroup, payments }) => {
      const groupStatus = getStatusForGroupOfFeeRecords(feeRecordEntitiesInGroup);
      const { reconciledByUser, dateReconciled } = await getReconciliationDataForFeeRecords(feeRecordEntitiesInGroup, groupStatus);

      if (payments.length === 0) {
        // If there are no payments, there is only one fee record in the group
        const feeRecord = mapFeeRecordEntityToFeeRecord(feeRecordEntitiesInGroup[0]);
        const totalReportedPayments = feeRecord.reportedPayments;

        return {
          feeRecords: [feeRecord],
          totalReportedPayments,
          paymentsReceived: null,
          totalPaymentsReceived: null,
          status: groupStatus,
          reconciledByUser,
          dateReconciled,
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
        status: groupStatus,
        reconciledByUser,
        dateReconciled,
      };
    }),
  );
