import { BaseViewModel } from '../base-view-model';

export type RecordCorrectionConfirmationViewModel = BaseViewModel & {
  formattedReportPeriod: string;
  sentToEmails: string[];
};
