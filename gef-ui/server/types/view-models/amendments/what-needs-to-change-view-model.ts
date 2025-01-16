import { ViewModelErrors } from '../view-model-errors';

export type WhatNeedsToChangeViewModel = {
  changeFacilityValue?: boolean;
  changeCoverEndDate?: boolean;
  exporterName: string;
  previousPage: string;
  cancelUrl: string;
  amendmentFormEmail: string;
  errors?: ViewModelErrors | null;
};
