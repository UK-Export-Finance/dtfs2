import { ViewModelErrors } from '../view-model-errors';

export type FacilityValueViewModel = {
  facilityValue?: number;
  currencySymbol: string;
  exporterName: string;
  previousPage: string;
  cancelUrl: string;
  errors?: ViewModelErrors | null;
};
