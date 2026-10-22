import { CURRENCY } from '@ukef/constants';
import { RecordCorrectionFormValues } from '@ukef/types';

export const aRecordCorrectionFormValues = (): RecordCorrectionFormValues => ({
  utilisation: '10,000.23',
  facilityId: '11111111',
  reportedCurrency: CURRENCY.GBP,
  reportedFee: '100.23',
  additionalComments: 'Some additional comments',
});
