const api = require('./api');
const centralApi = require('./centralApi');
const MOCK_PORTAL_USERS = require('./portal-users');
const MOCK_BANKS = require('./banks');
const MOCKS = require('./bss');

const insertMocks = async (mockDataLoaderToken) => {
  console.info('Users');
  for (const user of Object.values(MOCK_PORTAL_USERS)) {
    await api.createUser(user, mockDataLoaderToken);
  }

  console.info('Banks');
  for (const bank of MOCK_BANKS) {
    await api.createBank(bank, mockDataLoaderToken);
  }

  console.info('BSS MCs');
  for (const mandatoryCriteria of MOCKS.MANDATORY_CRITERIA) {
    await api.createMandatoryCriteria(mandatoryCriteria, mockDataLoaderToken);
  }

  console.info('BSS ECs');
  for (const eligibilityCriteria of MOCKS.ELIGIBILITY_CRITERIA) {
    await api.createEligibilityCriteria(eligibilityCriteria, mockDataLoaderToken);
  }

  const maker = MOCK_PORTAL_USERS.BANK1_MAKER3;
  const makerToken = await api.loginViaPortal(maker);

  console.info('BSS deals');
  const insertedDeals = [];
  for (const deal of MOCKS.DEALS) {
    const { _id } = await api.createDeal(deal, makerToken);
    const { deal: createdDeal } = await api.getDeal(_id, makerToken);

    insertedDeals.push(createdDeal);
  }

  console.info('BSS facilities');
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
