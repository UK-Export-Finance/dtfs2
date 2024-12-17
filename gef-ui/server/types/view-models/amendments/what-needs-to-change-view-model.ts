import { ViewModelErrors } from '../view-model-errors';

export type WhatNeedsToChangeViewModel = {
  changeFacilityValue?: boolean;
  changeCoverEndDate?: boolean;
  exporterName: string;
  previousPage: string;
  amendmentFormEmail: string;
  errors?: ViewModelErrors;
};
