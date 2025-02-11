import { Currency } from './currency';

// TODO FN-3843: Update the remainder of these to be null rather than undefined?
export type RecordCorrectionTransientFormData = {
  utilisation?: number;
  reportedCurrency?: Currency;
  reportedFee?: number;
  facilityId?: string;
  additionalComments: string | null;
};
