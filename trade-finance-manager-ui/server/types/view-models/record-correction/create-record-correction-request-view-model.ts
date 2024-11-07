import { BaseViewModel } from '../base-view-model';

export type CreateRecordCorrectionRequestViewModel = BaseViewModel & {
  reportId: string;
  bank: { name: string };
  formattedReportPeriod: string;
  // TODO: Add additional props in here, e.g. the content for the blue box
};
