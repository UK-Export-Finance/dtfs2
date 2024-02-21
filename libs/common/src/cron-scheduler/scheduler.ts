import cron from 'node-cron';
import { SchedulerJob } from './scheduler.types';
import { asyncTaskToSyncTask, taskWithErrorLogging } from './scheduler.helpers';

export const initialiseCronScheduler = (jobs: SchedulerJob[]) => {
  jobs.forEach((job) => {
    const { cronExpression, description, task } = job;

    if (!cron.validate(cronExpression)) {
      console.error("Failed to add scheduled job '%s' due to invalid cron expression: '%s'", description, cronExpression);
      return;
    }

    console.info("Adding scheduled job '%s' on schedule '%s'", description, cronExpression);
    cron
      .schedule(cronExpression, asyncTaskToSyncTask(taskWithErrorLogging(description, task)))
      .on('error', (error) => console.error("An error occurred scheduling job '%s': %O", description, error));
  });
};
