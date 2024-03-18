const api = require('./gef/api');
const { logger } = require('./helpers/logger.helper');

const cleanEligibilityCriteria = async (token) => {
  logger.info('cleaning GEF tables');
  logger.info('cleaning GEF eligibility-criteria', { depth: 1 });
  for (const data of await api.listEligibilityCriteria(token)) {
    await api.deleteEligibilityCriteria(data, token);
  }
};

const cleanMandatoryCriteriaVersioned = async (token) => {
  logger.info('cleaning GEF mandatory-criteria-versioned', { depth: 1 });

  for (const mandatoryCriteria of await api.listMandatoryCriteriaVersioned(token)) {
    await api.deleteMandatoryCriteriaVersioned(mandatoryCriteria, token);
  }
};

const cleanDurableFunctions = async (token) => {
  logger.info('cleaning durable-functions-log', { depth: 1 });
  await api.deleteDurableFunctions(token);
};

const deleteCronJobs = async (token) => {
  logger.info('cleaning cron-job-logs', { depth: 1 });
  await api.deleteCronJobs(token);
};

const cleanAllTables = async (token) => {
  await cleanEligibilityCriteria(token);
  await cleanMandatoryCriteriaVersioned(token);
  await cleanDurableFunctions(token);
  await deleteCronJobs(token);
};

module.exports = cleanAllTables;
