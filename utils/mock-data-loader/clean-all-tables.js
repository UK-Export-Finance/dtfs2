const api = require('./api');
const gefApi = require('./gef/api');
const centralApi = require('./centralApi');
const tokenFor = require('./temporary-token-handler');

const cleanBanks = async (token) => {
  console.info('cleaning banks');

  const banks = await api.listBanks(token);

  if (banks.length > 0) {
    for (const bank of banks) {
      await api.deleteBank(bank, token);
    }
  }
};

const cleanFacilities = async (token) => {
  console.info('cleaning all facilities');

  const facilities = await centralApi.listFacilities();
  for (const facility of facilities) {
    if (facility.type === 'Bond'
      || facility.type === 'Loan') {
      await centralApi.deleteFacility(facility._id, token);
    }

    if (facility.type === 'Cash'
      || facility.type === 'Contingent') {
      await gefApi.deleteFacilities(facility, token);
    }
  }
};

const cleanDeals = async (token) => {
  console.info('cleaning Portal deals');

  const deals = await api.listDeals(token);

  if (deals) {
    for (const deal of deals) {
      // NOTE: BSS and GEF deals use different MongoDB _ids.
      // Therefore they currently have their own endpoints to delete
      // to use the correct .find({ _id ... }) with or without ObjectId.
      // When BSS and GEF have the same _id generation,
      // they can use the same endpoint.
      if (deal.product === 'BSS/EWCS') {
        await api.deleteDeal(deal._id, token);
      }

      if (deal.product === 'GEF') {
        await gefApi.deleteDeal(deal._id, token);
      }
    }
  }
};

const cleanMandatoryCriteria = async (token) => {
  console.info('cleaning BSS mandatory-criteria');

  for (const mandatoryCriteria of await api.listMandatoryCriteria(token)) {
    await api.deleteMandatoryCriteria(mandatoryCriteria.version, token);
  }
};

const cleanEligibilityCriteria = async (token) => {
  console.info('cleaning BSS eligibility-criteria');

  for (const eligibilityCriteria of await api.listEligibilityCriteria(token)) {
    await api.deleteEligibilityCriteria(eligibilityCriteria.version, token);
  }
};

const cleanUsers = async () => {
  console.info('cleaning Portal users');

  for (const user of await api.listUsers()) {
    await api.deleteUser(user);
  }
};

const cleanAllTables = async () => {
  const token = await tokenFor({
    username: 'admin',
    email: 'admin-2',
    password: 'AbC!2345',
    roles: ['maker', 'editor'],
    bank: { id: '*' },
  });

  await cleanBanks(token);
  await cleanDeals(token);
  await cleanFacilities(token);
  await cleanMandatoryCriteria(token);
  await cleanEligibilityCriteria(token);
  await cleanUsers();
};

module.exports = cleanAllTables;
