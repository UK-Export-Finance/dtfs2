import { In } from 'typeorm';
import { remove } from 'lodash';
import { FEE_RECORD_STATUS, FeeRecordEntity, FeeRecordPaymentJoinTableEntity, FeeRecordStatus } from '@ukef/dtfs2-common';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments } from '../../../../../mapping/keying-sheet-mapping';
import { KeyingSheet, KeyingSheetFeePayment, KeyingSheetRow } from '../../../../../types/fee-records';

const STATUSES_OF_FEE_RECORDS_TO_DISPLAY_ON_KEYING_SHEET: FeeRecordStatus[] = [FEE_RECORD_STATUS.READY_TO_KEY, FEE_RECORD_STATUS.RECONCILED];

/**
 * Gets all the keying sheet fee record payment join table entries
 * linked to the report with id matching the supplied report id
 * @param reportId - The report id
 * @returns The join table entries linked to the report id
 */
const getKeyingSheetFeeRecordPaymentJoinTableEntries = async (reportId: number): Promise<FeeRecordPaymentJoinTableEntity[]> =>
  await SqlDbDataSource.manager.find(FeeRecordPaymentJoinTableEntity, {
    where: {
      feeRecord: {
        report: { id: reportId },
        status: In(STATUSES_OF_FEE_RECORDS_TO_DISPLAY_ON_KEYING_SHEET),
      },
    },
    relations: {
      feeRecord: true,
      payment: true,
    },
  });

/**
 * Gets a zero amount keying sheet fee payment for the supplied fee record entity
 * @param param - The fee record entity
 * @returns The zero amount keying sheet fee payment
 */
const getZeroAmountKeyingSheetFeePayment = ({ paymentCurrency }: FeeRecordEntity): KeyingSheetFeePayment => ({
  currency: paymentCurrency,
  amount: 0,
  dateReceived: null,
});

/**
 * Gets the keying sheet for the report with id matching the supplied report id
 * @param reportId - The report id
 * @returns The keying sheet
 */
export const getKeyingSheetForReportId = async (reportId: number, allReportFeeRecords: FeeRecordEntity[]): Promise<KeyingSheet> => {
  const joinTableEntities = await getKeyingSheetFeeRecordPaymentJoinTableEntries(reportId);
  const keyingSheetFeeRecordsWithZeroFeePayment = allReportFeeRecords.filter(({ status }) =>
    STATUSES_OF_FEE_RECORDS_TO_DISPLAY_ON_KEYING_SHEET.includes(status),
  );

  const feeRecordIdToKeyingSheetRowMap = joinTableEntities.reduce(
    (map, { feeRecord, payment, paymentAmountUsedForFeeRecord }) => {
      if (paymentAmountUsedForFeeRecord === null) {
        return map;
      }

      const feeRecordId = feeRecord.id;
      remove(keyingSheetFeeRecordsWithZeroFeePayment, ({ id }) => id === feeRecordId);

      const feePayment: KeyingSheetFeePayment = {
        currency: payment.currency,
        amount: paymentAmountUsedForFeeRecord,
        dateReceived: paymentAmountUsedForFeeRecord ? payment.dateReceived : null,
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

  const keyingSheetRowsWithZeroAmountFeePayments = keyingSheetFeeRecordsWithZeroFeePayment.map((feeRecord) => ({
    ...mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments(feeRecord),
    feePayments: [getZeroAmountKeyingSheetFeePayment(feeRecord)],
  }));

  return [...Object.values(feeRecordIdToKeyingSheetRowMap), ...keyingSheetRowsWithZeroAmountFeePayments];
};
