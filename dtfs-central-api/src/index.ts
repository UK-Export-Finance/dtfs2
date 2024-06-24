import { initialiseCronJobScheduler } from '@ukef/dtfs2-common';
import { createApp } from './createApp';
import { cronSchedulerJobs } from './cron-scheduler-jobs';

initialiseCronJobScheduler(cronSchedulerJobs);

const PORT = process.env.PORT || 5005;

(async () => {
  const app = await createApp();
  app.listen(PORT, () => console.info('✅ Central micro-service initialised on %s', PORT));
})();
