const api = require('./api');
const centralApi = require('./centralApi');
const PORTAL_MOCKS = require('./portal');
const MOCK_BANKS = require('./banks');
const MOCKS = require('./bss');
const { logger } = require('./helpers/logger.helper');

const insertMocks = async (mockDataLoaderToken) => {
  logger.info('inserting portal mocks');
  logger.info('inserting portal users', { depth: 1 });
  for (const user of Object.values(PORTAL_MOCKS.USERS)) {
    await api.createUser(user, mockDataLoaderToken);
  }

  logger.info('inserting banks', { depth: 1 });
  for (const bank of MOCK_BANKS) {
    await api.createBank(bank, mockDataLoaderToken);
  }

  logger.info('inserting BSS mandatory-criteria', { depth: 1 });
  for (const mandatoryCriteria of MOCKS.MANDATORY_CRITERIA) {
    await api.createMandatoryCriteria(mandatoryCriteria, mockDataLoaderToken);
  }

  logger.info('inserting BSS eligibility-criteria', { depth: 1 });
  for (const eligibilityCriteria of MOCKS.ELIGIBILITY_CRITERIA) {
    await api.createEligibilityCriteria(eligibilityCriteria, mockDataLoaderToken);
  }

  const maker = PORTAL_MOCKS.USERS.BANK1_MAKER3;
  const makerToken = await api.loginViaPortal(maker);

  logger.info('inserting BSS deals', { depth: 1 });
  const insertedDeals = [];
  for (const deal of MOCKS.DEALS) {
    const { _id } = await api.createDeal(deal, makerToken);
    const { deal: createdDeal } = await api.getDeal(_id, makerToken);

    insertedDeals.push(createdDeal);
  }

  logger.info('inserting BSS facilities', { depth: 1 });
  MOCKS.FACILITIES.forEach(async (facility) => {
    const associatedDeal = insertedDeals.find((deal) => deal.mockId === facility.mockDealId);
    const facilityToInsert = {
      ...facility,
      dealId: associatedDeal._id,
    };
    await centralApi.createFacility(facilityToInsert, facilityToInsert.dealId, makerToken);
  });
};

module.exports = insertMocks;
