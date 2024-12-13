import { ViewModelErrors } from '../view-model-errors';

export type FacilityValueViewModel = {
  dealId: string;
  facilityId: string;
  amendmentId: string;
  facilityValue?: number;
  currencySymbol: string;
  exporterName: string;
  previousPage: string;
  cancelUrl: string;
  errors?: ViewModelErrors | null;
};
