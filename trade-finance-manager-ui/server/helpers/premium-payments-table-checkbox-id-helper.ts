import { CURRENCY, Currency, FEE_RECORD_STATUS, FeeRecordStatus } from '@ukef/dtfs2-common';
import { PremiumPaymentsTableCheckboxId } from '../types/premium-payments-table-checkbox-id';

const CURRENCY_REGEX_GROUP = `(?<currency>${Object.values(CURRENCY).join('|')})`;
const CURRENCY_REGEX = new RegExp(CURRENCY_REGEX_GROUP);

const FEE_RECORD_STATUS_REGEX_GROUP = `(?<status>${Object.values(FEE_RECORD_STATUS).join('|')})`;
const FEE_RECORD_STATUS_REGEX = new RegExp(FEE_RECORD_STATUS_REGEX_GROUP);

const PREMIUM_PAYMENTS_TABLE_CHECKBOX_ID_REGEX = new RegExp(
  `feeRecordId-\\d+-reportedPaymentsCurrency-${CURRENCY_REGEX_GROUP}-status-${FEE_RECORD_STATUS_REGEX_GROUP}`,
);

export const getPremiumPaymentsCheckboxIdsFromObjectKeys = (object: object): PremiumPaymentsTableCheckboxId[] =>
  Object.keys(object).filter((key) => PREMIUM_PAYMENTS_TABLE_CHECKBOX_ID_REGEX.test(key)) as PremiumPaymentsTableCheckboxId[];

export const getFeeRecordStatusFromPremiumPaymentsCheckboxId = (checkboxId: PremiumPaymentsTableCheckboxId): FeeRecordStatus => {
  const { status } = checkboxId.match(FEE_RECORD_STATUS_REGEX)!.groups!;
  return status as FeeRecordStatus;
};

export const getFeeRecordPaymentCurrencyFromPremiumPaymentsCheckboxId = (checkboxId: PremiumPaymentsTableCheckboxId): Currency => {
  const { currency } = checkboxId.match(CURRENCY_REGEX)!.groups!;
  return currency as Currency;
};

export const getFeeRecordIdFromPremiumPaymentsCheckboxId = (checkboxId: PremiumPaymentsTableCheckboxId): number => {
  const { id } = checkboxId.match(`feeRecordId-(?<id>\\d+)`)!.groups!;
  return Number(id);
};
