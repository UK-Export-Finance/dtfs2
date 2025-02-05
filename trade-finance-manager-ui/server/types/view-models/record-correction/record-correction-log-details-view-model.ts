import { RecordCorrectionLogFields } from '@ukef/dtfs2-common';
import { BaseViewModel } from '../base-view-model';

export type RecordCorrectionLogDetailsViewModel = BaseViewModel & {
  mappedCorrectionLog: RecordCorrectionLogFields;
  status: string;
  displayStatus: string;
  formattedReportPeriod: string;
  bankName: string;
};
