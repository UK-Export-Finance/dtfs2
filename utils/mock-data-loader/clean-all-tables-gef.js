const api = require('./gef/api');
const tokenFor = require('./temporary-token-handler');

const cleanApplication = async (token) => {
  console.log('cleaning application');

  for (data of await api.listApplication(token)) {
    await api.deleteApplication(data, token);
  }
};

const cleanMandatoryCriteriaVersioned = async (token) => {
  console.log('cleaning mandatory-criteria-versioned');

  for (mandatoryCriteria of await api.listMandatoryCriteriaVersioned(token)) {
    await api.deleteMandatoryCriteriaVersioned(mandatoryCriteria, token);
  }
};

const cleanAllTables = async () => {
  const token = await tokenFor({
    username: 'admin',
    password: 'AbC!2345',
    roles: ['maker', 'editor', 'checker'],
    bank: { id: '*' },
  });

  await cleanApplication(token);
  await cleanMandatoryCriteriaVersioned(token);
};

module.exports = cleanAllTables;
