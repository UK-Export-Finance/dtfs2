const cron = require('node-cron');
const jobs = require('./jobs');

const initScheduler = () => {
  Object.values(jobs).forEach((job) => {
    const { schedule, task, message } = job.init();
    console.log(`Add schedule: ${message}`);
    cron.schedule(schedule, task);
  });
};

module.exports = initScheduler;
