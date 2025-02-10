import { DayMonthYearInput, FacilityType } from '@ukef/dtfs2-common';
import { ViewModelErrors } from '../view-model-errors';

export type FacilityEndDateViewModel = {
  exporterName: string;
  facilityType: FacilityType;
  previousPage: string;
  cancelUrl: string;
  errors?: ViewModelErrors | null;
  facilityEndDate?: DayMonthYearInput | null;
};
