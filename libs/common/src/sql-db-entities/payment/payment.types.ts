import { Currency } from '../../types';
import { FeeRecordEntity } from '../fee-record';
import { DbRequestSource } from '../helpers';

export type CreatePaymentParams = {
  currency: Currency;
  amountReceived: number;
  dateReceived: Date;
  paymentReference?: string;
  feeRecords: FeeRecordEntity[];
  requestSource: DbRequestSource;
};
