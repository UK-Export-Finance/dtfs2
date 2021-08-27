const api = require('./api');
const centralApi = require('./centralApi');
const tokenFor = require('./temporary-token-handler');

const cleanBanks = async (token) => {
  console.log('cleaning banks');

  for (bank of await api.listBanks(token)) {
    await api.deleteBank(bank, token);
  }
};

const cleanFacilities = async (token) => {
  console.log('cleaning central facilities');

  for (facility of await centralApi.listFacilities()) {
    await centralApi.deleteFacility(facility._id, token);
  }
};

const cleanDeals = async (token) => {
  console.log('cleaning deals');
  const deals = await api.listDeals(token);

  if (deals) {
    for (deal of deals) {
      await api.deleteDeal(deal, token);
    }
  }
};

const cleanMandatoryCriteria = async (token) => {
  console.log('cleaning mandatory-criteria');

  for (mandatoryCriteria of await api.listMandatoryCriteria(token)) {
    await api.deleteMandatoryCriteria(mandatoryCriteria, token);
  }
};

const cleanEligibilityCriteria = async (token) => {
  console.log('cleaning eligibility-criteria');

  for (eligibilityCriteria of await api.listEligibilityCriteria(token)) {
    await api.deleteEligibilityCriteria(eligibilityCriteria, token);
  }
};

const cleanUsers = async () => {
  console.log('cleaning users');

  for (user of await api.listUsers()) {
    await api.deleteUser(user);
  }
};

const cleanAllTables = async () => {
  const token = await tokenFor({
    username: 'admin',
    password: 'AbC!2345',
    roles: ['maker', 'editor'],
    bank: { id: '*' },
  });

  await cleanBanks(token);
  await cleanDeals(token);
  await cleanFacilities();
  await cleanMandatoryCriteria(token);
  await cleanEligibilityCriteria(token);
  await cleanUsers();
};

module.exports = cleanAllTables;
