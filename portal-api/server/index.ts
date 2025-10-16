import dotenv from 'dotenv';
import { initialiseCronJobScheduler } from '@ukef/dtfs2-common';
import { cronSchedulerJobs } from './cron-scheduler-jobs';

dotenv.config();

initialiseCronJobScheduler(cronSchedulerJobs);

// eslint-disable-next-line import/first
import app from './createApp';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.info('✅ Portal API micro-service initialised on %s', PORT));
