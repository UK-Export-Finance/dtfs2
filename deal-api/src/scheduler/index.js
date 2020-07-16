const cron = require('node-cron');
const jobs = require('./jobs');

const initScheduler = () => {
  if (process.env.DTFS_PORTAL_SCHEDULER) {
    Object.values(jobs).forEach((job) => {
      const { schedule, task, message } = job.init();
      console.log(`Added schedule: ${message}`);
      cron.schedule(schedule, task);
    });
  } else {
    console.log('Portal scheduler not running');
  }
};

module.exports = initScheduler;
