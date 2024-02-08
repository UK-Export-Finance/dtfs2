import CronJobManager from 'cron-job-manager';
import { getCollection } from '../database';

const cronJobTimer = new Date();

if (process.env.NODE_ENV === 'development') {
  // Artificial 30 second delay to allow for race condition on slow machines in local development
  cronJobTimer.setSeconds(cronJobTimer.getSeconds() + 30);
}

export const eStoreCronJobManager = new CronJobManager(
  'eStoreCronJobManager',
  cronJobTimer, // run task as soon as the server is ready
  () => {
    eStoreCronJobManager.deleteJob('eStoreCronJobManager');
  },
  {
    start: true,
    onComplete: async () => {
      const collection = await getCollection('cron-job-logs');
      await collection.insertOne({ status: 'eStore Cron Job Manager started successfully', timestamp: cronJobTimer });
      console.info('eStore Cron Job Manager started successfully at %o', cronJobTimer);
    },
    timezone: 'Europe/London',
  },
);
