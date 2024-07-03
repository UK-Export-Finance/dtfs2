import { EditPremiumPaymentsTableCheckboxId } from '../types/edit-premium-payments-table-checkbox-id';

const EDIT_PREMIUM_PAYMENTS_TABLE_CHECKBOX_ID_REGEX = /feeRecordId-(?<id>\d+)/;

export const getEditPremiumPaymentsCheckboxIdsFromObjectKeys = (object: object): EditPremiumPaymentsTableCheckboxId[] =>
  Object.keys(object).filter((key) => EDIT_PREMIUM_PAYMENTS_TABLE_CHECKBOX_ID_REGEX.test(key)) as EditPremiumPaymentsTableCheckboxId[];

export const getFeeRecordIdsFromEditPremiumPaymentsCheckboxIds = (checkboxIds: EditPremiumPaymentsTableCheckboxId[]): number[] =>
  checkboxIds.reduce((ids, checkboxId) => {
    const { id } = EDIT_PREMIUM_PAYMENTS_TABLE_CHECKBOX_ID_REGEX.exec(checkboxId)!.groups!;
    return [...ids, parseInt(id, 10)];
  }, [] as number[]);
