import { ViewModelErrors } from '../view-model-errors';

export type CoverEndDateViewModel = {
  coverEndDate?: string | Date;
  exporterName: string;
  previousPage: string;
  cancelUrl: string;
  errors?: ViewModelErrors | null;
};
