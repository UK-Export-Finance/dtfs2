import { RecordCorrectionTransientFormData } from '@ukef/types';

export const anEmptyRecordCorrectionTransientFormData = (): RecordCorrectionTransientFormData => ({
  utilisation: null,
  reportedCurrency: null,
  reportedFee: null,
  facilityId: null,
  additionalComments: null,
});
