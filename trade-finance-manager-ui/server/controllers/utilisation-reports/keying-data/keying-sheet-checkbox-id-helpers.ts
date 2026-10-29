import { KEYING_SHEET_ROW_STATUS, KeyingSheetRowStatus, REGEX } from '@ukef/dtfs2-common';
import { KeyingSheetCheckboxId } from '../../../types/keying-sheet-checkbox-id';

const KEYING_SHEET_ROW_CHECKBOX_ID_REGEX = REGEX.createKeyingSheetRowCheckboxIdRegex(Object.values(KEYING_SHEET_ROW_STATUS));

const getKeyingSheetCheckboxIdsFromObjectKeys = (object: object): KeyingSheetCheckboxId[] =>
  Object.keys(object).filter((key) => KEYING_SHEET_ROW_CHECKBOX_ID_REGEX.test(key)) as KeyingSheetCheckboxId[];

const getFeeRecordIdsAndStatusesFromKeyingSheetCheckboxIds = (checkboxIds: KeyingSheetCheckboxId[]): { id: number; status: KeyingSheetRowStatus }[] =>
  checkboxIds.map((checkboxId) => {
    const { id, status } = KEYING_SHEET_ROW_CHECKBOX_ID_REGEX.exec(checkboxId)!.groups!;
    return { id: Number(id), status: status as KeyingSheetRowStatus };
  });

export const getFeeRecordIdsForKeyingSheetRowsWithStatusFromObjectKeys = (object: object, status: KeyingSheetRowStatus) => {
  const checkboxIds = getKeyingSheetCheckboxIdsFromObjectKeys(object);
  const feeRecordIdsWithStatuses = getFeeRecordIdsAndStatusesFromKeyingSheetCheckboxIds(checkboxIds);
  return feeRecordIdsWithStatuses.filter((feeRecordIdWithStatus) => feeRecordIdWithStatus.status === status).map(({ id }) => id);
};
