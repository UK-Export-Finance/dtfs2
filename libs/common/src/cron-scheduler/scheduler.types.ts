import cron from 'node-cron';

export type CronScheduleFunc = Parameters<typeof cron.schedule>[1];

// eslint-disable-next-line @typescript-eslint/ban-types
type CronScheduleFuncParameters = Parameters<Extract<CronScheduleFunc, Function>>[0];

export type CronSchedulerJobTask = (now: CronScheduleFuncParameters) => void | Promise<void>;

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
