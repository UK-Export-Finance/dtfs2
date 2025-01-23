import { AmendmentsEligibilityCriterionWithAnswer, FacilityType } from '@ukef/dtfs2-common';
import { ViewModelErrors } from '../view-model-errors';

export type EligibilityViewModel = {
  exporterName: string;
  facilityType: FacilityType;
  previousPage: string;
  cancelUrl: string;
  criteria?: AmendmentsEligibilityCriterionWithAnswer[];
  errors?: ViewModelErrors | null;
};
