import { DayMonthYearInput, FacilityType } from '@ukef/dtfs2-common';
import { ViewModelErrors } from '../view-model-errors';

export type EffectiveDateViewModel = {
  exporterName: string;
  facilityType: FacilityType;
  previousPage: string;
  cancelUrl: string;
  errors?: ViewModelErrors | null;
  canMakerCancelAmendment: boolean;
  effectiveDate?: DayMonthYearInput;
};
