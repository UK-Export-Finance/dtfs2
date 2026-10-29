import { REGEX } from '@ukef/dtfs2-common';
import { EditPaymentsTableCheckboxId } from '../types/edit-payments-table-checkbox-id';

export const getEditPaymentsCheckboxIdsFromObjectKeys = (object: object): EditPaymentsTableCheckboxId[] =>
  Object.keys(object).filter((key) => REGEX.EDIT_PAYMENTS_TABLE_CHECKBOX_ID_REGEX.test(key)) as EditPaymentsTableCheckboxId[];

export const getFeeRecordIdsFromEditPaymentsCheckboxIds = (checkboxIds: EditPaymentsTableCheckboxId[]): number[] =>
  checkboxIds.reduce((ids, checkboxId) => {
    const { id } = REGEX.EDIT_PAYMENTS_TABLE_CHECKBOX_ID_REGEX.exec(checkboxId)!.groups!;
    return [...ids, parseInt(id, 10)];
  }, [] as number[]);
