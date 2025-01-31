import { CronSchedulerJob } from '@ukef/dtfs2-common';
import { createUtilisationReportForBanksJob } from './create-utilisation-reports';
import { deleteCompleteAcbsDurableFunctionLogsJob } from './delete-acbs-durable-function-logs';
import { cancelDealJob } from './deal-cancellation/cancel-deal-job';
import { deleteCorrectionAndCorrectionRequestTransientFormDataJob } from './delete-correction-and-correction-request-transient-form-data';

export const cronSchedulerJobs: CronSchedulerJob[] = [
  createUtilisationReportForBanksJob,
  deleteCompleteAcbsDurableFunctionLogsJob,
  cancelDealJob,
  deleteCorrectionAndCorrectionRequestTransientFormDataJob,
];
