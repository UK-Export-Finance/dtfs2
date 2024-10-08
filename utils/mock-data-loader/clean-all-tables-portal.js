const api = require('./api');
const gefApi = require('./gef/api');
const centralApi = require('./centralApi');
const { mockDataLoaderUser } = require('./user-helper');
const { logger } = require('./helpers/logger.helper');

const cleanBanks = async (token) => {
  logger.info('cleaning banks', { depth: 1 });
  const banks = await api.listBanks(token);

  if (banks.length > 0) {
    for (const bank of banks) {
      await api.deleteBank(bank, token);
    }
  }
};

const cleanFacilities = async (token) => {
  logger.info('cleaning all facilities', { depth: 1 });

  const facilities = await centralApi.listFacilities();
  for (const facility of facilities) {
    if (facility.type === 'Bond' || facility.type === 'Loan') {
      await centralApi.deleteFacility(facility._id, token);
    }

    if (facility.type === 'Cash' || facility.type === 'Contingent') {
      await gefApi.deleteFacilities(facility, token);
    }
  }
};

const cleanDeals = async (token) => {
  logger.info('cleaning Portal deals', { depth: 1 });

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
  logger.info('cleaning BSS mandatory-criteria', { depth: 1 });

  for (const mandatoryCriteria of await api.listMandatoryCriteria(token)) {
    await api.deleteMandatoryCriteria(mandatoryCriteria.version, token);
  }
};

const cleanEligibilityCriteria = async (token) => {
  logger.info('cleaning BSS eligibility-criteria', { depth: 1 });

  for (const eligibilityCriteria of await api.listEligibilityCriteria(token)) {
    await api.deleteEligibilityCriteria(eligibilityCriteria.version, token);
  }
};

const cleanUsers = async (token) => {
  logger.info('cleaning Portal users', { depth: 1 });

  for (const user of await api.listUsers(token)) {
    if (user.username !== mockDataLoaderUser.username) {
      await api.deleteUser(user, token);
    }
  }
};

const cleanAllTablesPortal = async (token) => {
  logger.info('cleaning portal tables');
  await cleanBanks(token);
  await cleanDeals(token);
  await cleanFacilities(token);
  await cleanMandatoryCriteria(token);
  await cleanEligibilityCriteria(token);
  await cleanUsers(token);
};

module.exports = cleanAllTablesPortal;
