const api = require('./api');
const centralApi = require('./centralApi');
const MOCKS = require('./bss');

const tokenFor = require('./temporary-token-handler');

const insertMocks = async () => {
  const token = await tokenFor({
    username: 're-insert-mocks',
    password: 'AbC!2345',
    firstname: 'Mock',
    surname: 'DataLoader',
    roles: ['maker', 'editor', 'data-admin'],
    bank: MOCKS.BANKS.find((bank) => bank.id === '9'),
  });

  const tfmMaker = MOCKS.USERS.find((user) => user.username === 'BANK1_MAKER1');
  const tfmMakerToken = await tokenFor({
    ...tfmMaker,
  });

  console.log('inserting users');
  for (user of MOCKS.USERS) {
    await api.createUser(user);
  }

  console.log('inserting banks');
  for (bank of MOCKS.BANKS) {
    await api.createBank(bank, token);
  }


  console.log('inserting mandatory-criteria');
  for (mandatoryCriteria of MOCKS.MANDATORY_CRITERIA) {
    await api.createMandatoryCriteria(mandatoryCriteria, token);
  }

  console.log('inserting eligibility-criteria');
  for (eligibilityCriteria of MOCKS.ELIGIBILITY_CRITERIA) {
    await api.createEligibilityCriteria(eligibilityCriteria, token);
  }

  console.log('inserting BSS deals');
  const insertedDeals = [];

  for (deal of MOCKS.DEALS) {
    const { _id } = await api.createDeal(deal, tfmMakerToken);
    const { deal: createdDeal } = await api.getDeal(_id, tfmMakerToken);

    insertedDeals.push(createdDeal);
  }

  console.log('inserting BSS facilites into central');

  for (facility of MOCKS.FACILITIES) {
    const associatedDeal = insertedDeals.find((deal) => deal.mockId === facility.mockDealId);

    const facilityToInsert = {
      ...facility,
      associatedDealId: associatedDeal._id,
    };

    await centralApi.createFacility(facilityToInsert, facilityToInsert.associatedDealId, tfmMakerToken);
  }
};

module.exports = insertMocks;
