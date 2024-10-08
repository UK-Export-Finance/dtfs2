import { EditPaymentsTableCheckboxId } from '../types/edit-payments-table-checkbox-id';

const EDIT_PAYMENTS_TABLE_CHECKBOX_ID_REGEX = /feeRecordId-(?<id>\d+)/;

export const getEditPaymentsCheckboxIdsFromObjectKeys = (object: object): EditPaymentsTableCheckboxId[] =>
  Object.keys(object).filter((key) => EDIT_PAYMENTS_TABLE_CHECKBOX_ID_REGEX.test(key)) as EditPaymentsTableCheckboxId[];

export const getFeeRecordIdsFromEditPaymentsCheckboxIds = (checkboxIds: EditPaymentsTableCheckboxId[]): number[] =>
  checkboxIds.reduce((ids, checkboxId) => {
    const { id } = EDIT_PAYMENTS_TABLE_CHECKBOX_ID_REGEX.exec(checkboxId)!.groups!;
    return [...ids, parseInt(id, 10)];
  }, [] as number[]);
