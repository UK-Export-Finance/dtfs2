const api = require('./api');
const gefApi = require('./gef/api');
const centralApi = require('./centralApi');
const tokenFor = require('./temporary-token-handler');

const cleanBanks = async (token) => {
  console.log('cleaning banks');

  const banks = await api.listBanks(token);

  if (banks.length > 0) {
    for (bank of banks) {
      await api.deleteBank(bank, token);
    }
  }
};

const cleanFacilities = async (token) => {
  console.log('cleaning central facilities');

  for (facility of await centralApi.listFacilities()) {
    await centralApi.deleteFacility(facility._id, token);
  }
};

const cleanDeals = async (token) => {
  const deals = await api.listDeals(token);

  // TODO: when GEF deals are in deals collection,
  // currently api.listDeals doesn't return any GEF deals.
  // it uses graphQL and GEF things are not in schema/no resolvers.
  if (deals) {
    for (deal of deals) {
      if (deal.dealType === 'BSS/EWCS') {
        await api.deleteDeal(deal._id, token);
      }

      // if (deal.dealType === 'GEF') {
      //   await gefApi.deleteDeal(deal._id, token);
      // }
    }
  }
};

const cleanMandatoryCriteria = async (token) => {
  console.log('cleaning BSS mandatory-criteria');

  for (mandatoryCriteria of await api.listMandatoryCriteria(token)) {
    await api.deleteMandatoryCriteria(mandatoryCriteria, token);
  }
};

const cleanEligibilityCriteria = async (token) => {
  console.log('cleaning BSS eligibility-criteria');

  for (eligibilityCriteria of await api.listEligibilityCriteria(token)) {
    await api.deleteEligibilityCriteria(eligibilityCriteria, token);
  }
};

const cleanUsers = async () => {
  console.log('cleaning Portal users');

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
