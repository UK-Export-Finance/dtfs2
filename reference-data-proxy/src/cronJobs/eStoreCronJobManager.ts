import CronJobManager from 'cron-job-manager';
import { getCollection } from '../database';

const cronJobTimer = new Date();
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
      await collection.insertOne({ status: 'eStore Cron Job Manager started successfully', timestamp: new Date() });
      console.info('eStore Cron Job Manager started successfully at', new Date());
    },
    timezone: 'Europe/London',
  },
);
