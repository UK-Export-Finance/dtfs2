const api = require('./gef/api');
const tokenFor = require('./temporary-token-handler');

const cleanEligibilityCriteria = async (token) => {
  console.info('cleaning GEF eligibility-criteria');

  for (const data of await api.listEligibilityCriteria(token)) {
    await api.deleteEligibilityCriteria(data, token);
  }
};

const cleanMandatoryCriteriaVersioned = async (token) => {
  console.info('cleaning GEF mandatory-criteria-versioned');

  for (const mandatoryCriteria of await api.listMandatoryCriteriaVersioned(token)) {
    await api.deleteMandatoryCriteriaVersioned(mandatoryCriteria, token);
  }
};

const cleanDurableFunctions = async (token) => {
  console.info('cleaning durable-functions-log');
  await api.getDurableFunctions(token);
};

const deleteCronJobs = async (token) => {
  console.info('cleaning cron-job-logs');
  await api.deleteCronJobs(token);
};

const cleanAllTables = async () => {
  const token = await tokenFor({
    username: 'admin',
    password: 'AbC!2345',
    email: 'admin-1',
    roles: ['maker', 'editor', 'checker'],
    bank: { id: '*' },
  });

  await cleanEligibilityCriteria(token);
  await cleanMandatoryCriteriaVersioned(token);
  await cleanDurableFunctions(token);
  await deleteCronJobs(token);
};

module.exports = cleanAllTables;
