import { CronSchedulerJob } from '@ukef/dtfs2-common';
import { createUtilisationReportForBanksJob } from './create-utilisation-reports';
import { deleteAcbsDurableFunctionLogsJob } from './delete-acbs-durable-function-logs';

export const cronSchedulerJobs: CronSchedulerJob[] = [createUtilisationReportForBanksJob, deleteAcbsDurableFunctionLogsJob];
