import { Currency } from '../../types';
import { FeeRecordEntity } from '../fee-record';
import { DbRequestSource } from '../helpers';

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
