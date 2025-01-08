import { Currency } from './currency';

export type RecordCorrectionTransientFormData = {
  utilisation?: number;
  reportedCurrency?: Currency;
  reportedFee?: number;
  facilityId?: string;
  additionalComments?: string;
};
