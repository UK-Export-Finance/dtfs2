import { Currency } from './currency';

export type RecordCorrectionValues = {
  facilityUtilisation: number | null;
  feesPaidToUkefForThePeriod: number | null;
  feesPaidToUkefForThePeriodCurrency: Currency | null;
  facilityId: string | null;
};
