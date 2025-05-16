import { ViewModelErrors } from '../view-model-errors';

export type ReturnAmendmentToMakerViewModel = {
  exporterName: string;
  dealId: string;
  facilityId: string;
  amendmentId: string;
  previousPage: string;
  errors?: ViewModelErrors | null;
  facilityType: string;
  maxCommentLength: number;
  comment?: string;
  isReturningAmendmentToMaker: boolean;
};
