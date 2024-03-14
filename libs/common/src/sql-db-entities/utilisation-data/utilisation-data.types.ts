import { DbRequestSourceParam } from '../helpers';
import { Currency } from '../../types';

export type CreateUtilisationDataParams = DbRequestSourceParam & {
  facilityId: string;
  exporter: string;
  baseCurrency: Currency;
  facilityUtilisation: number;
  totalFeesAccruedForTheMonth: number;
  totalFeesAccruedForTheMonthCurrency: Currency;
  totalFeesAccruedForTheMonthExchangeRate: number;
  monthlyFeesPaidToUkef: number;
  monthlyFeesPaidToUkefCurrency: Currency;
  paymentCurrency: Currency;
  paymentExchangeRate: number;
};
