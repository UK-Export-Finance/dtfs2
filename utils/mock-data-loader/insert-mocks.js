const api = require('./api');
const centralApi = require('./centralApi');
const PORTAL_MOCKS = require('./portal');
const MOCK_BANKS = require('./banks');
const MOCKS = require('./bss');

const createAndReturnCreatedDeal = async (deal, makerToken) => {
  const { _id } = await api.createDeal(deal, makerToken);
  const { deal: createdDeal } = await api.getDeal(_id, makerToken);
  return createdDeal;
};

const insertMocks = async (mockDataLoaderToken) => {
  console.info('inserting Portal users');
  for (const user of PORTAL_MOCKS.USERS) {
    await api.createUser(user, mockDataLoaderToken);
  }

  console.info('inserting banks');
  for (const bank of MOCK_BANKS) {
    await api.createBank(bank, mockDataLoaderToken);
  }

  console.info('inserting BSS mandatory-criteria');
  for (const mandatoryCriteria of MOCKS.MANDATORY_CRITERIA) {
    await api.createMandatoryCriteria(mandatoryCriteria, mockDataLoaderToken);
  }

  console.info('inserting BSS eligibility-criteria');
  for (const eligibilityCriteria of MOCKS.ELIGIBILITY_CRITERIA) {
    await api.createEligibilityCriteria(eligibilityCriteria, mockDataLoaderToken);
  }

  const maker = PORTAL_MOCKS.USERS.find((user) => user.username === 'BANK1_MAKER3');
  const makerToken = await api.loginViaPortal(maker);

  console.info('inserting BSS deals');
  const insertedDealsNotToSubmit = await Promise.all(MOCKS.DEALS.dealsNotToSubmit.map((deal) => createAndReturnCreatedDeal(deal, makerToken)));
  const insertedDealsToSubmit = await Promise.all(MOCKS.DEALS.dealsToSubmitToTfm.map((deal) => createAndReturnCreatedDeal(deal, makerToken)));

  const allInsertedDeals = [...insertedDealsNotToSubmit, ...insertedDealsToSubmit];

  console.info('inserting BSS facilities');
  MOCKS.FACILITIES.forEach(async (facility) => {
    const associatedDeal = allInsertedDeals.find((deal) => deal.mockId === facility.mockDealId);
    const facilityToInsert = {
      ...facility,
      dealId: associatedDeal._id,
    };
    await centralApi.createFacility(facilityToInsert, facilityToInsert.dealId, makerToken);
  });

  console.info('submitting deals to checker');
  insertedDealsToSubmit.forEach(async ({ _id }) => {
    await api.submitDealToChecker(_id, makerToken);
  });

  console.info('submitting deals to TFM');
  const checker = PORTAL_MOCKS.USERS.find((user) => user.username === 'BANK1_CHECKER1');
  const checkerToken = await api.loginViaPortal(checker);
  insertedDealsToSubmit.forEach(async ({ _id }) => {
    await api.submitDealToTfm(_id, checkerToken);
  });
};

module.exports = insertMocks;
