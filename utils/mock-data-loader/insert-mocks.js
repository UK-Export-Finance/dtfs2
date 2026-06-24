const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const api = require('./api');
const centralApi = require('./centralApi');
const { mongoDbClient: db } = require('../drivers/db-client');
const MOCK_PORTAL_USERS = require('./portal-users');
const MOCK_BANKS = require('./banks');
const MOCK_PORTAL_BANK_LIST = require('./portal-bank-list');
const MOCKS = require('./bss');
const { testDeals } = require('./e2e/test-deals');

const insertMocks = async (mockDataLoaderToken, e2e, params) => {
  console.info('Users');
  for (const user of Object.values(MOCK_PORTAL_USERS)) {
    await api.createUser(user, mockDataLoaderToken);
  }

  console.info('Banks');
  for (const bank of MOCK_BANKS) {
    await api.createBank(bank, mockDataLoaderToken);
  }

  console.info('Portal bank list');
  const portalBankListCollection = await db.getCollection(MONGO_DB_COLLECTIONS.PORTAL_BANK_LIST);
  await portalBankListCollection.deleteMany({});
  /**
   * Drop any existing non-`_id_` indexes so re-running the loader against a
   * long-lived environment cannot fail with `IndexOptionsConflict` if the
   * collection already has a differently-configured index on `{ name: 1 }`
   * or `{ order: 1 }`.
   */
  await portalBankListCollection.dropIndexes();
  await portalBankListCollection.createIndex({ name: 1 }, { unique: true });
  await portalBankListCollection.createIndex({ order: 1 }, { unique: true });
  if (MOCK_PORTAL_BANK_LIST.length > 0) {
    await portalBankListCollection.insertMany(MOCK_PORTAL_BANK_LIST);
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

  let insertDeals = MOCKS.DEALS;
  let insertFacilities = MOCKS.FACILITIES;
  if (e2e) {
    const { deals, facilities } = testDeals(params);
    insertDeals = deals.BSS;
    insertFacilities = facilities.BSS;
  }

  console.info('BSS deals');
  const insertedDeals = [];
  for (const deal of insertDeals) {
    const { _id } = await api.createDeal(deal, makerToken);
    const { deal: createdDeal } = await api.getDeal(_id, makerToken);

    insertedDeals.push(createdDeal);

    if (e2e) {
      console.info('BSS facilities');
      for (const facility of deal.mockFacilities) {
        const facilityToInsert = {
          ...facility,
          dealId: createdDeal._id,
        };

        await centralApi.createFacility(facilityToInsert, facilityToInsert.dealId, makerToken);
      }
    }
  }

  if (!e2e) {
    console.info('BSS facilities');
    insertFacilities.forEach(async (facility) => {
      const associatedDeal = insertedDeals.find((deal) => deal.mockId === facility.mockDealId);

      const facilityToInsert = {
        ...facility,
        dealId: associatedDeal._id,
      };

      await centralApi.createFacility(facilityToInsert, facilityToInsert.dealId, makerToken);
    });
  }
};

module.exports = insertMocks;
