import { FacilityType } from '@ukef/dtfs2-common';
import { ViewModelErrors } from '../view-model-errors';

export type DoYouHaveAFacilityEndDateViewModel = {
  exporterName: string;
  facilityType: FacilityType;
  previousPage: string;
  cancelUrl: string;
  errors?: ViewModelErrors | null;
  isUsingFacilityEndDate?: string;
};
