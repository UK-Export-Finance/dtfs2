import { CronSchedulerJob } from '@ukef/dtfs2-common';
import { createUtilisationReportForBanksJob } from './create-utilisation-reports';
import { deleteCompleteAcbsDurableFunctionLogsJob } from './delete-acbs-durable-function-logs';
import { cancelDealJob } from './deal-cancellation/cancel-deal-job';
import { deleteTransientRecordCorrectionRequestsJob } from './delete-transient-record-correction-requests';

export const cronSchedulerJobs: CronSchedulerJob[] = [
  createUtilisationReportForBanksJob,
  deleteCompleteAcbsDurableFunctionLogsJob,
  cancelDealJob,
  deleteTransientRecordCorrectionRequestsJob,
];
