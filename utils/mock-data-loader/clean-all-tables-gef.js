const api = require('./gef/api');
const tokenFor = require('./temporary-token-handler');

const cleanApplication = async (token) => {
  console.log('cleaning application');

  for (const data of await api.listApplication(token)) {
    await api.deleteApplication(data, token);
  }
};

const cleanExporter = async (token) => {
  console.log('cleaning exporter');

  for (const data of await api.listApplication(token)) {
    await api.deleteExporter(data.exporterId, token);
  }
};

const cleanFacilities = async (token) => {
  console.log('cleaning facilities');

  for (const data of await api.listFacilities(token)) {
    await api.deleteFacilities(data.details, token);
  }
};

const cleanEligibilityCriteria = async (token) => {
  console.log('cleaning eligibility-criteria');

  for (const data of await api.listEligibilityCriteria(token)) {
    await api.deleteEligibilityCriteria(data, token);
  }
};

const cleanMandatoryCriteriaVersioned = async (token) => {
  console.log('cleaning mandatory-criteria-versioned');

  for (const mandatoryCriteria of await api.listMandatoryCriteriaVersioned(token)) {
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
  await cleanExporter(token);
  await cleanFacilities(token);
  await cleanEligibilityCriteria(token);
  await cleanMandatoryCriteriaVersioned(token);
};

module.exports = cleanAllTables;
