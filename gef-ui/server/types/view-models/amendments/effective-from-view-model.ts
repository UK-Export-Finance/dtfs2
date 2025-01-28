import { DayMonthYearInput, FacilityType } from '@ukef/dtfs2-common';
import { ViewModelErrors } from '../view-model-errors';

export type EffectiveFromViewModel = {
  exporterName: string;
  facilityType: FacilityType;
  previousPage: string;
  cancelUrl: string;
  errors?: ViewModelErrors | null;
  effectiveFrom?: DayMonthYearInput;
};
