import { CronSchedulerJob } from '@ukef/dtfs2-common';
import { checkAzureAcbsFunction } from './check-azure-acbs-function.js';
import { checkAzureNumberGeneratorFunction } from './check-azure-number-generator-function.js';

export const cronSchedulerJobs: CronSchedulerJob[] = [checkAzureAcbsFunction, checkAzureNumberGeneratorFunction];
