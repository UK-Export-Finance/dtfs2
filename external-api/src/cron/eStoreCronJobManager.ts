import CronJobManager from 'cron-job-manager';
const timer = new Date();

/**
 * eStore CRON job manager, responsible for managing
 * all eStore CRON jobs. The manager is initiated imminentely
 * with a dummy job to be deleted upon its execution.
 */
export const eStoreCronJobManager = new CronJobManager(
  'estore_cron_job', // CRON job identifier
  timer, // Execute CRON job upon initialisation
  () => {
    eStoreCronJobManager.deleteJob('estore_cron_job');
  },
  // Options passed to node-cron
  {
    start: true,
    timezone: 'Europe/London',
    onComplete: () => {
      // Executed once the job has stopped
      console.info('eStore CRON job manager intitiated successfully at %s', timer);
    },
  },
);
