import { ReportPeriod } from '@ukef/dtfs2-common';

export type SaveFeeRecordCorrectionResponseBody = {
  sentToEmails: string[];
  reportPeriod: ReportPeriod;
};
