import dotenv from 'dotenv';
import { initialiseCronJobScheduler } from '@ukef/dtfs2-common';
import { cronSchedulerJobs } from './cron-scheduler-jobs';
import app from './createApp';

dotenv.config({ quiet: true });

initialiseCronJobScheduler(cronSchedulerJobs);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.info('✅ Portal API micro-service initialised on %s', PORT));
