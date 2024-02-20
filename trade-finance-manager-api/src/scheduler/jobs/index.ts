import { SchedulerJob } from '@ukef/dtfs2-common';
import { checkAzureAcbsFunction } from './check-azure-acbs-function';
import { checkAzureNumberGeneratorFunction } from './check-azure-number-generator-function';

export const jobs: SchedulerJob[] = [checkAzureAcbsFunction, checkAzureNumberGeneratorFunction];
