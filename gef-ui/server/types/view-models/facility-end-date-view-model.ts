import { ViewModelErrors } from './view-model-errors';

export type FacilityEndDateViewModel = {
  dealId: string;
  facilityId: string;
  facilityEndDate?: { day: string; month: string; year: string };
  previousPage: string;
  status?: string;
  errors?: ViewModelErrors | null;
};
