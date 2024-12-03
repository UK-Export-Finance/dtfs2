import { ViewModelErrors } from '../view-model-errors';

export type FacilityValueViewModel = {
  dealId: string;
  facilityId: string;
  amendmentId: string;
  facilityValue: number | undefined;
  exporterName: string;
  previousPage: string;
  errors?: ViewModelErrors | null;
};
