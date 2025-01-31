import { CURRENCY } from '../../constants';
import { RecordCorrectionValues } from '../../types';

export const aRecordCorrectionValues = (): RecordCorrectionValues => ({
  facilityUtilisation: 1000,
  feesPaidToUkefForThePeriod: 500,
  feesPaidToUkefForThePeriodCurrency: CURRENCY.EUR,
  facilityId: '12345678',
});
