export type TaskInput = Date | 'manual' | 'init';

export type SchedulerJob = {
  init: () => {
    /**
     * A cron expression representing when the job will run
     */
    schedule: string;
    /**
     * A description of the job
     */
    message: string;
    /**
     * The task to be run by the job
     */
    task: (now: TaskInput) => void | Promise<void>;
  };
};
