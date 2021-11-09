const api = require('./api');
const centralApi = require('./centralApi');
const PORTAL_MOCKS = require('./portal');
const MOCK_BANKS = require('./banks');
const MOCKS = require('./bss');

const tokenFor = require('./temporary-token-handler');

const insertMocks = async () => {
  const token = await tokenFor({
    username: 're-insert-mocks',
    password: 'AbC!2345',
    firstname: 'Mock',
    surname: 'DataLoader',
    roles: ['maker', 'editor', 'data-admin'],
    bank: MOCK_BANKS.find((bank) => bank.id === '9'),
  });

  const tfmMaker = PORTAL_MOCKS.USERS.find((user) => user.username === 'BANK1_MAKER1');
  const tfmMakerToken = await tokenFor({
    ...tfmMaker,
  });

  console.log('inserting portal users');
  for (const user of PORTAL_MOCKS.USERS) {
    await api.createUser(user);
  }

  console.log('inserting banks');
  for (const bank of MOCK_BANKS) {
    await api.createBank(bank, token);
  }


  console.log('inserting mandatory-criteria');
  for (const mandatoryCriteria of MOCKS.MANDATORY_CRITERIA) {
    await api.createMandatoryCriteria(mandatoryCriteria, token);
  }

  console.log('inserting eligibility-criteria');
  for (const eligibilityCriteria of MOCKS.ELIGIBILITY_CRITERIA) {
    await api.createEligibilityCriteria(eligibilityCriteria, token);
  }

  console.log('inserting BSS deals');
  const insertedDeals = [];

  for (const deal of MOCKS.DEALS) {
    const { _id } = await api.createDeal(deal, tfmMakerToken);
    const { deal: createdDeal } = await api.getDeal(_id, tfmMakerToken);

    insertedDeals.push(createdDeal);
  }

  console.log('inserting BSS facilites into central');

  for (const facility of MOCKS.FACILITIES) {
    const associatedDeal = insertedDeals.find((deal) => deal.mockId === facility.mockDealId);

    const facilityToInsert = {
      ...facility,
      associatedDealId: associatedDeal._id,
    };

    await centralApi.createFacility(facilityToInsert, facilityToInsert.associatedDealId, tfmMakerToken);
  }
};

module.exports = insertMocks;
