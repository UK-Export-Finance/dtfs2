import { FacilityType } from '@ukef/dtfs2-common';
import { ViewModelErrors } from '../view-model-errors';

export type WhatNeedsToChangeViewModel = {
  changeFacilityValue?: boolean;
  changeCoverEndDate?: boolean;
  exporterName: string;
  facilityType: FacilityType;
  previousPage: string;
  cancelUrl: string;
  amendmentFormEmail: string;
  errors?: ViewModelErrors | null;
};
