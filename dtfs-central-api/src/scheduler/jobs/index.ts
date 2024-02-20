import { SchedulerJob } from '@ukef/dtfs2-common';
import { createUtilisationReportForBanksJob } from './create-utilisation-reports';

export const jobs: SchedulerJob[] = [createUtilisationReportForBanksJob];
