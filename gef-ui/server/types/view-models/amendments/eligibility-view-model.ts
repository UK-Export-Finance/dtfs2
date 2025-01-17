import { AmendmentsEligibilityCriterion } from '@ukef/dtfs2-common';
import { ViewModelErrors } from '../view-model-errors';

export type EligibilityViewModel = {
  exporterName: string;
  previousPage: string;
  cancelUrl: string;
  criteria?: AmendmentsEligibilityCriterion[];
  errors?: ViewModelErrors | null;
};
