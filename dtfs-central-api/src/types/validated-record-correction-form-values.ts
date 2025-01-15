import { Currency } from '@ukef/dtfs2-common';

export type ValidatedRecordCorrectionTransientFormData = {
  utilisation?: string;
  reportedCurrency?: Currency;
  reportedFee?: string;
  facilityId?: string;
  additionalComments?: string;
};
