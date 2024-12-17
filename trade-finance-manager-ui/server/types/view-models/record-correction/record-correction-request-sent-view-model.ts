import { BaseViewModel } from '../base-view-model';

export type RecordCorrectionRequestSentViewModel = BaseViewModel & {
  bank: { name: string };
  formattedReportPeriod: string;
  reportId: string;
  requestedByUserEmail: string;
  emailsWithoutRequestedByUserEmail: string[];
};
