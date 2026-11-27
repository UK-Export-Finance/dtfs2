import * as cron from 'node-cron';
import { CronSchedulerJob } from './scheduler.types';
import { asyncTaskToSyncTask, taskWithErrorLogging } from './scheduler.helpers';

/**
 * Validates and sets up the given jobs to run according to when their cron
 * expression ticks.
 */
export const initialiseCronJobScheduler = (jobs: CronSchedulerJob[]) => {
  jobs.forEach((job) => {
    const { cronExpression, description, task } = job;

    if (!cron.validate(cronExpression)) {
      console.error("Failed to add scheduled job '%s' due to invalid cron expression: '%s'", description, cronExpression);
      return;
    }

    console.info("Adding scheduled job '%s' on schedule '%s'", description, cronExpression);
    const runTask = asyncTaskToSyncTask(taskWithErrorLogging(description, task));
    // v3 skipped runs once their matching second had passed.
    cron.schedule(cronExpression, ({ triggeredAt }) => runTask(triggeredAt), { missedExecutionTolerance: 0 });
  });
};
