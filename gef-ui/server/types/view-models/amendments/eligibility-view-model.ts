import { FacilityType } from '@ukef/dtfs2-common';
import { ViewModelErrors } from '../view-model-errors';

export type EligibilityCriterion = {
  id: number;
  text: string;
  textList?: string[];
  answer?: boolean;
};

export type EligibilityViewModel = {
  exporterName: string;
  facilityType: FacilityType;
  previousPage: string;
  cancelUrl: string;
  criteria?: EligibilityCriterion[]; // TODO 7765: Make required property when fetching this from database
  errors?: ViewModelErrors | null;
};
