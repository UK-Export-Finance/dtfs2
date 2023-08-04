const cron = require('node-cron');
const jobs = require('./jobs');

const initScheduler = () => {
  Object.values(jobs).forEach((job) => {
    const { schedule, task, message } = job.init();
    console.info('Added schedule: %s on schedule %s', message, schedule);
    if (schedule) {
      cron.schedule(schedule, task);
    }
  });
};

module.exports = initScheduler;
