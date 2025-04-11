import { ViewModelErrors } from '../view-model-errors';

export type ConfirmAmendmentSubmissionViewModel = {
  exporterName: string;
  dealId: string;
  facilityId: string;
  amendmentId: string;
  previousPage: string;
  errors?: ViewModelErrors | null;
};
