import { BaseViewModel } from '../base-view-model';

export type RecordCorrectionSentViewModel = BaseViewModel & {
  formattedReportPeriod: string;
  sentToEmails: string[];
};
