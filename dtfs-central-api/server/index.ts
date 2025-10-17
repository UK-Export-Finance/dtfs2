import dotenv from 'dotenv';
import { initialiseCronJobScheduler } from '@ukef/dtfs2-common';
import { cronSchedulerJobs } from './cron-scheduler-jobs';
import { createApp } from './createApp';

dotenv.config();

initialiseCronJobScheduler(cronSchedulerJobs);

const PORT = process.env.PORT || 5005;

createApp()
  .then((app) => {
    app.listen(PORT, () => console.info('✅ Central micro-service initialised on %s', PORT));
  })
  .catch((error) => {
    console.error('Failed to start app:', error);
    throw error;
  });
