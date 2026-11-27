import { CronSchedulerJobTask } from './scheduler.types';

export const asyncTaskToSyncTask =
  (task: CronSchedulerJobTask): ((now: Date | 'manual' | 'init') => void) =>
  (now) => {
    void task(now);
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
