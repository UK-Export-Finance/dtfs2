const cron = require('node-cron');
const jobs = require('./jobs');

const initScheduler = () => {
  Object.values(jobs).forEach((job) => {
    const { schedule, task, message } = job.init();
    console.info(`Added schedule: ${message} on schedule ${schedule}`);
    if (schedule) {
      cron.schedule(schedule, task);
    }
  });
};

module.exports = initScheduler;
