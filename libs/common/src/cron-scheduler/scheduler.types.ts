export type CronScheduleFunc = ((now: Date | 'manual' | 'init') => void) | string;

/**
 * The scheduler passes the time at which the task starts.
 */
export type CronSchedulerJobTask = (now: Date | 'manual' | 'init') => void | Promise<void>;

export type CronSchedulerJob = {
  /**
   * A cron expression representing when the job will run
   */
  cronExpression: string;
  /**
   * A description of the job
   */
  description: string;
  /**
   * The task to be run by the job
   */
  task: CronSchedulerJobTask;
};
