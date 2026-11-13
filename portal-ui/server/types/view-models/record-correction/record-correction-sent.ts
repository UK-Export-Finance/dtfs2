import { BaseViewModel } from '@ukef/portal-ui/server/types/view-models/base-view-model';

export type RecordCorrectionSentViewModel = BaseViewModel & {
  formattedReportPeriod: string;
  sentToEmails: string[];
};
