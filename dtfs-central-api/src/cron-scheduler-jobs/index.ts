import { CronSchedulerJob } from '@ukef/dtfs2-common';
import { createUtilisationReportForBanksJob } from './create-utilisation-reports';

export const cronSchedulerJobs: CronSchedulerJob[] = [createUtilisationReportForBanksJob];
