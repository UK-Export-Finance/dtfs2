import CronJobManager from 'cron-job-manager';
import { getCollection } from '../database';

export const eStoreCronJobManager = new CronJobManager(
  'eStoreCronJobManager',
  '1 * * * * *', // run task as soon as the server is ready (1 = 1 second)
  () => {
    eStoreCronJobManager.deleteJob('eStoreCronJobManager');
  },
  {
    start: true,
    onComplete: async () => {
      const collection = await getCollection('cron-job-logs');
      await collection.insertOne({ status: 'eStore Cron Job Manager started successfully', timestamp: new Date() });
      console.info('eStore Cron Job Manager started successfully');
    },
    timezone: 'Europe/London',
  },
);
