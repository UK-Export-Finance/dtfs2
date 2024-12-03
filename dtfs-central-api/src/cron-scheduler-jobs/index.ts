import { CronSchedulerJob } from '@ukef/dtfs2-common';
import { createUtilisationReportForBanksJob } from './create-utilisation-reports';
import { deleteCompleteAcbsDurableFunctionLogsJob } from './delete-acbs-durable-function-logs';
import { cancelDealJob } from './deal-cancellation/cancel-deal-job';

export const cronSchedulerJobs: CronSchedulerJob[] = [createUtilisationReportForBanksJob, deleteCompleteAcbsDurableFunctionLogsJob, cancelDealJob];
