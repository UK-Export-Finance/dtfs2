import { DayMonthYearInput } from '@ukef/dtfs2-common';
import { ViewModelErrors } from '../view-model-errors';

export type CoverEndDateViewModel = {
  coverEndDate?: DayMonthYearInput;
  exporterName: string;
  previousPage: string;
  cancelUrl: string;
  errors?: ViewModelErrors | null;
};
