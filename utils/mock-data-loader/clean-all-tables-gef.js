const api = require('./gef/api');
const tokenFor = require('./temporary-token-handler');

const cleanFacilities = async (token) => {
  console.info('cleaning GEF facilities');

  for (const data of await api.listFacilities(token)) {
    await api.deleteFacilities(data, token);
  }
};

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

const cleanAllTables = async () => {
  const token = await tokenFor({
    username: 'admin',
    password: 'AbC!2345',
    roles: ['maker', 'editor', 'checker'],
    bank: { id: '*' },
  });

  await cleanFacilities(token);
  await cleanEligibilityCriteria(token);
  await cleanMandatoryCriteriaVersioned(token);
  await cleanDurableFunctions(token);
};

module.exports = cleanAllTables;
