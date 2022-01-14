const api = require('./gef/api');
const tokenFor = require('./temporary-token-handler');

const cleanEligibilityCriteria = async (token) => {
  console.log('cleaning GEF eligibility-criteria');

  for (const data of await api.listEligibilityCriteria(token)) {
    await api.deleteEligibilityCriteria(data, token);
  }
};

const cleanMandatoryCriteriaVersioned = async (token) => {
  console.log('cleaning GEF mandatory-criteria-versioned');

  for (const mandatoryCriteria of await api.listMandatoryCriteriaVersioned(token)) {
    await api.deleteMandatoryCriteriaVersioned(mandatoryCriteria, token);
  }
};

const cleanDurableFunctions = async (token) => {
  console.log('cleaning durable-functions-log');
  await api.getDurableFunctions(token);
};

const cleanAllTables = async () => {
  const token = await tokenFor({
    username: 'admin',
    password: 'AbC!2345',
    roles: ['maker', 'editor', 'checker'],
    bank: { id: '*' },
  });

  await cleanEligibilityCriteria(token);
  await cleanMandatoryCriteriaVersioned(token);
  await cleanDurableFunctions(token);
};

module.exports = cleanAllTables;
