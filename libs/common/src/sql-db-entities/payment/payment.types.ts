import { Currency } from '@ukef/types';
import { FeeRecordEntity } from '@ukef/sql-db-entities/fee-record';
import { DbRequestSource } from '@ukef/sql-db-entities/helpers';

export type CreatePaymentParams = {
  currency: Currency;
  amount: number;
  dateReceived: Date;
  reference?: string;
  feeRecords: FeeRecordEntity[];
  requestSource: DbRequestSource;
};

export type UpdatePaymentParams = {
  amount: number;
  dateReceived: Date;
  reference: string | undefined;
  requestSource: DbRequestSource;
};

export type UpdateWithAdditionalFeeRecordsParams = {
  additionalFeeRecords: FeeRecordEntity[];
  requestSource: DbRequestSource;
};
