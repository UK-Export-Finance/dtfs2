import { ViewModelErrors } from '../view-model-errors';

export type FacilityValueViewModel = {
  facilityValue: number | undefined;
  exporterName: string;
  previousPage: string;
  errors?: ViewModelErrors | null;
};
