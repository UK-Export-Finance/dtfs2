import { In } from 'typeorm';
import { FeeRecordPaymentJoinTableEntity, FeeRecordStatus } from '@ukef/dtfs2-common';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments } from '../../../../../mapping/keying-sheet-mapping';
import { KeyingSheet, KeyingSheetFeePayment, KeyingSheetRow } from '../../../../../types/fee-records';

/**
 * Gets all the keying sheet fee record payment join table entries
 * linked to the report with id matching the supplied report id
 * @param reportId - The report id
 * @returns The join table entries linked to the report id
 */
const getAndValidateKeyingSheetFeeRecordPaymentJoinTableEntries = async (reportId: number): Promise<FeeRecordPaymentJoinTableEntity[]> => {
  const joinTableEntities = await SqlDbDataSource.manager.find(FeeRecordPaymentJoinTableEntity, {
    where: {
      feeRecord: {
        report: { id: reportId },
        status: In<FeeRecordStatus>(['READY_TO_KEY', 'RECONCILED']),
      },
    },
    relations: {
      feeRecord: true,
      payment: true,
    },
  });

  if (joinTableEntities.length === 0) {
    throw new Error(`Failed to find keying sheet fee record payment join table entries for report id '${reportId}'`);
  }

  return joinTableEntities;
};

/**
 * Gets the keying sheet for the report with id matching the supplied report id
 * @param reportId - The report id
 * @returns The keying sheet
 */
export const getKeyingSheetForReportId = async (reportId: number): Promise<KeyingSheet> => {
  const joinTableEntities = await getAndValidateKeyingSheetFeeRecordPaymentJoinTableEntries(reportId);

  const feeRecordIdToKeyingSheetRowMap = joinTableEntities.reduce(
    (map, { feeRecord, payment, paymentAmountUsedForFeeRecord }) => {
      if (paymentAmountUsedForFeeRecord === null) {
        throw new Error('Expected fee record at READY_TO_KEY or RECONCILED status to have a defined paymentAmountUsedForFeeRecord on the join table');
      }

      const feeRecordId = feeRecord.id;
      const feePayment: KeyingSheetFeePayment = {
        dateReceived: payment.dateReceived,
        currency: payment.currency,
        amount: paymentAmountUsedForFeeRecord,
      };

      if (!map[feeRecordId]) {
        return {
          ...map,
          [feeRecordId]: {
            ...mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments(feeRecord),
            feePayments: [feePayment],
          },
        };
      }

      map[feeRecordId].feePayments.push(feePayment);
      return map;
    },
    {} as { [key: number]: KeyingSheetRow },
  );

  return Object.values(feeRecordIdToKeyingSheetRowMap);
};
