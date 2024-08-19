import { CURRENCY, Currency, FEE_RECORD_STATUS, FeeRecordStatus } from '@ukef/dtfs2-common';
import { PremiumPaymentsTableCheckboxId } from '../types/premium-payments-table-checkbox-id';

const COMMA_SEPARATED_IDS_REGEX_GROUP = `(?<commaSeparatedIds>(\\d+,?)+)`;
const COMMA_SEPARATED_IDS_REGEX = new RegExp(COMMA_SEPARATED_IDS_REGEX_GROUP);

const CURRENCY_REGEX_GROUP = `(?<currency>${Object.values(CURRENCY).join('|')})`;
const CURRENCY_REGEX = new RegExp(CURRENCY_REGEX_GROUP);

const FEE_RECORD_STATUS_REGEX_GROUP = `(?<status>${Object.values(FEE_RECORD_STATUS).join('|')})`;
const FEE_RECORD_STATUS_REGEX = new RegExp(FEE_RECORD_STATUS_REGEX_GROUP);

const PREMIUM_PAYMENTS_TABLE_CHECKBOX_ID_REGEX = new RegExp(
  `feeRecordIds-${COMMA_SEPARATED_IDS_REGEX_GROUP}-reportedPaymentsCurrency-${CURRENCY_REGEX_GROUP}-status-${FEE_RECORD_STATUS_REGEX_GROUP}`,
);

export const getPremiumPaymentsCheckboxIdsFromObjectKeys = (object: object): PremiumPaymentsTableCheckboxId[] =>
  Object.keys(object).filter((key) => PREMIUM_PAYMENTS_TABLE_CHECKBOX_ID_REGEX.test(key)) as PremiumPaymentsTableCheckboxId[];

export const getFeeRecordStatusFromPremiumPaymentsCheckboxId = (checkboxId: PremiumPaymentsTableCheckboxId): FeeRecordStatus => {
  const { status } = FEE_RECORD_STATUS_REGEX.exec(checkboxId)!.groups!;
  return status as FeeRecordStatus;
};

export const getFeeRecordPaymentCurrencyFromPremiumPaymentsCheckboxId = (checkboxId: PremiumPaymentsTableCheckboxId): Currency => {
  const { currency } = CURRENCY_REGEX.exec(checkboxId)!.groups!;
  return currency as Currency;
};

export const getFeeRecordIdsFromPremiumPaymentsCheckboxId = (checkboxId: PremiumPaymentsTableCheckboxId): number[] => {
  const { commaSeparatedIds } = COMMA_SEPARATED_IDS_REGEX.exec(checkboxId)!.groups!;

  return commaSeparatedIds.split(',').map((id) => parseInt(id, 10));
};

export const getFeeRecordIdsFromPremiumPaymentsCheckboxIds = (checkboxIds: PremiumPaymentsTableCheckboxId[]): number[] =>
  checkboxIds.reduce((ids, checkboxId) => {
    const newIds = getFeeRecordIdsFromPremiumPaymentsCheckboxId(checkboxId);
    return [...ids, ...newIds];
  }, [] as number[]);
