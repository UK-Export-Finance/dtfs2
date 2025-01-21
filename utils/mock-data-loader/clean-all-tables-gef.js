const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const api = require('./gef/api');
const { mongoDbClient } = require('../drivers/db-client');

const cleanEligibilityCriteria = async (token) => {
  console.info('cleaning GEF tables');
  console.info('cleaning GEF eligibility-criteria');
  for (const data of await api.listEligibilityCriteria(token)) {
    await api.deleteEligibilityCriteria(data, token);
  }
};

const cleanEligibilityCriteriaAmendments = async () => {
  console.info('cleaning GEF tables');
  console.info('cleaning GEF eligibilityCriteriaAmendments');

  const eligibilityCriteriaAmendmentsCollection = await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.ELIGIBILITY_CRITERIA_AMENDMENTS);
  await eligibilityCriteriaAmendmentsCollection.deleteMany({});
};

const cleanMandatoryCriteriaVersioned = async (token) => {
  console.info('cleaning GEF mandatory-criteria-versioned');

  for (const mandatoryCriteria of await api.listMandatoryCriteriaVersioned(token)) {
    await api.deleteMandatoryCriteriaVersioned(mandatoryCriteria, token);
  }
};

const cleanDurableFunctions = async (token) => {
  console.info('cleaning durable-functions-log');
  await api.deleteDurableFunctions(token);
};

const deleteCronJobs = async (token) => {
  console.info('cleaning cron-job-logs');
  await api.deleteCronJobs(token);
};

const cleanAllTables = async (token) => {
  await cleanEligibilityCriteria(token);
  await cleanEligibilityCriteriaAmendments(token);
  await cleanMandatoryCriteriaVersioned(token);
  await cleanDurableFunctions(token);
  await deleteCronJobs(token);
};

module.exports = cleanAllTables;
