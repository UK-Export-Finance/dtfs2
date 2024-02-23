import { SchedulerJob } from '../../types/scheduler-job';
import { createUtilisationReportForBanksJob } from './create-utilisation-reports';

export const jobs: SchedulerJob[] = [
  createUtilisationReportForBanksJob,
];
