const portalApi = require('./api');
const api = require('./gef/api');
const tokenFor = require('./temporary-token-handler');

const cleanExporter = async (token) => {
  console.log('cleaning GEF exporter');

  const deals = await portalApi.listDeals(token);
  for (deal of deals) {
    if (deal.dealType === 'GEF') {
      await api.deleteExporter(deal.exporterId, token);
    }
  }
};

const cleanFacilities = async (token) => {
  console.log('cleaning GEF facilities');

  for (data of await api.listFacilities(token)) {
    await api.deleteFacilities(data.details, token);
  }
};

const cleanEligibilityCriteria = async (token) => {
  console.log('cleaning GEF eligibility-criteria');

  for (data of await api.listEligibilityCriteria(token)) {
    await api.deleteEligibilityCriteria(data, token);
  }
};

const cleanMandatoryCriteriaVersioned = async (token) => {
  console.log('cleaning GEF mandatory-criteria-versioned');

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

  await cleanExporter(token);
  await cleanFacilities(token);
  await cleanEligibilityCriteria(token);
  await cleanMandatoryCriteriaVersioned(token);
};

module.exports = cleanAllTables;
