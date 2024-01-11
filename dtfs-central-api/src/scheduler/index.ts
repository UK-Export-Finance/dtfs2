import cron from 'node-cron';
import { jobs } from './jobs';
import { SchedulerJob, TaskInput } from '../types/scheduler-job';

/**
 * 'node-cron' requires the task function to return `void`, but
 * some of the scheduler functions return `Promise<void>`. This
 * function takes in any task and uses an IIFE to turn it into
 * a function with return type `void`.
 */
const promiseToVoid = (task: ReturnType<SchedulerJob['init']>['task']) => (now: TaskInput) => {
  (async () => {
    await task(now);
  })();
};

export const initScheduler = () => {
  jobs.forEach((job) => {
    const { schedule, message, task } = job.init();

    if (!cron.validate(schedule)) {
      console.error(`Failed to add job '${message}' due to invalid schedule '${schedule}'`);
      return;
    }

    console.info(`Adding scheduled job '${message}'`);
    cron.schedule(schedule, promiseToVoid(task)).on('error', (error) => console.error(`An error occurred running job '${message}':`, error));
  });
};
