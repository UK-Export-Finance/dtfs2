import { DbRequestSourceParam } from '../helpers';
import { Currency } from '../../types';

export type CreateFeeRecordParams = DbRequestSourceParam & {
  facilityId: string;
  exporter: string;
  baseCurrency: Currency;
  facilityUtilisation: number;
  totalFeesAccruedForThePeriod: number;
  totalFeesAccruedForThePeriodCurrency: Currency;
  totalFeesAccruedForThePeriodExchangeRate: number;
  feesPaidToUkefForThePeriod: number;
  feesPaidToUkefForThePeriodCurrency: Currency;
  paymentCurrency: Currency;
  paymentExchangeRate: number;
};
