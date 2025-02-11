import { Currency } from './currency';

export type RecordCorrectionTransientFormData = {
  utilisation: number | null;
  reportedCurrency: Currency | null;
  reportedFee: number | null;
  facilityId: string | null;
  additionalComments: string | null;
};
