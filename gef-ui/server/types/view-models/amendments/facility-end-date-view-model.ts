import { DayMonthYearInput } from '@ukef/dtfs2-common';
import { ViewModelErrors } from '../view-model-errors';

export type FacilityEndDateViewModel = {
  exporterName: string;
  previousPage: string;
  cancelUrl: string;
  errors?: ViewModelErrors | null;
  facilityEndDate?: DayMonthYearInput;
};
