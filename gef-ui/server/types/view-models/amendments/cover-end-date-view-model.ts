import { FacilityType } from '@ukef/dtfs2-common';
import { ViewModelErrors } from '../view-model-errors';

export type CoverEndDateViewModel = {
  coverEndDate?: string | Date;
  exporterName: string;
  facilityType: FacilityType;
  previousPage: string;
  cancelUrl: string;
  errors?: ViewModelErrors | null;
};
