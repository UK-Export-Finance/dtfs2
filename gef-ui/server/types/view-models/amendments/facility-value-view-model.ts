import { FacilityType } from '@ukef/dtfs2-common';
import { ViewModelErrors } from '../view-model-errors';

export type FacilityValueViewModel = {
  facilityValue?: string;
  currencySymbol: string;
  exporterName: string;
  facilityType: FacilityType;
  previousPage: string;
  cancelUrl: string;
  errors?: ViewModelErrors | null;
};
