const api = require('./api');
const centralApi = require('./centralApi');
const PORTAL_MOCKS = require('./portal');
const MOCK_BANKS = require('./banks');
const MOCKS = require('./bss');

const insertMocks = async (mockDataLoaderToken) => {
  console.info('inserting Portal users');
  for (const user of Object.values(PORTAL_MOCKS.USERS)) {
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

  const maker = PORTAL_MOCKS.USERS.BANK1_MAKER3;
  const makerToken = await api.loginViaPortal(maker);

  console.info('inserting BSS deals');
  const insertedDeals = [];
  for (const deal of MOCKS.DEALS) {
    const { _id } = await api.createDeal(deal, makerToken);
    const { deal: createdDeal } = await api.getDeal(_id, makerToken);

    insertedDeals.push(createdDeal);
  }

  console.info('inserting BSS facilities');
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
