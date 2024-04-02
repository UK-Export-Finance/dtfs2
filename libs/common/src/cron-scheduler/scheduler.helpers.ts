import { CronScheduleFunc, CronSchedulerJobTask } from './scheduler.types';

/**
 * 'node-cron' requires the task function to be synchronous (return type `void`)
 * but some of the scheduler functions are asynchronous (return type
 * `Promise<void>`). This function takes in any task and uses an IIFE to turn it
 * into a synchronous function
 */
export const asyncTaskToSyncTask =
  (task: CronSchedulerJobTask): CronScheduleFunc =>
  (now) => {
    (async () => {
      await task(now);
    })();
  };

/**
 * Wraps the given task to add logging of any errors that occur during execution
 */
export const taskWithErrorLogging =
  (description: string, task: CronSchedulerJobTask): CronSchedulerJobTask =>
  async (now) => {
    try {
      await task(now);
    } catch (error) {
      console.error("An error occurred running job '%s' %o", description, error);
      throw error;
    }
  };
