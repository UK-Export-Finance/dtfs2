const cron = require('node-cron');
const jobs = require('./jobs');

const initScheduler = () => {
  jobs.forEach((job) => {
    const { schedule, message, task } = job.init();

    if (cron.validate(schedule)) {
      console.info(`Adding scheduled job '${message}'`);
      cron.schedule(schedule, task).on('error', (error) => {
        console.error(`An error occurred running job ${message}:`, error);
      });
    } else {
      console.error(`Failed to add job '${message}' due to invalid schedule '${schedule}'`);
    }
  });
};

module.exports = initScheduler;
