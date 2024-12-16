import { ViewModelErrors } from '../view-model-errors';

export type DoYouHaveAFacilityEndDateViewModel = {
  exporterName: string;
  previousPage: string;
  cancelUrl: string;
  errors?: ViewModelErrors | null;
};
