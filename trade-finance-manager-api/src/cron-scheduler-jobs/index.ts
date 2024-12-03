import { CronSchedulerJob } from '@ukef/dtfs2-common';
import { checkAzureAcbsFunction } from './check-azure-acbs-function';

export const cronSchedulerJobs: CronSchedulerJob[] = [checkAzureAcbsFunction];
