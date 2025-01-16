import { ViewModelErrors } from '../view-model-errors';

export type EligibilityViewModel = {
  exporterName: string;
  previousPage: string;
  cancelUrl: string;
  criteria?: { id: number; description: string }[]; // TODO 7765: Remove optional property when fetching this from database
  errors?: ViewModelErrors | null;
};
