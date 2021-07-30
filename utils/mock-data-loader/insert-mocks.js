const api = require('./api');
const centralApi = require('./centralApi');
const MOCKS = require('./mocks');

const tokenFor = require('./temporary-token-handler');

const insertMocks = async () => {
  const token = await tokenFor({
    username: 're-insert-mocks',
    password: 'AbC!2345',
    firstname: 'Mock',
    surname: 'DataLoader',
    roles: ['maker', 'editor', 'data-admin'],
    bank: MOCKS.BANKS.find((bank) => bank.id === '956'),
  });

  const token2 = await tokenFor({
    username: 're-insert-mocks-2',
    password: 'AbC!2345',
    roles: ['maker', 'editor'],
    bank: MOCKS.BANKS.find((bank) => bank.id === '964'),
  });

  const tfmMaker = MOCKS.USERS.find((user) => user.username === 'MAKER-TFM');
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

  console.log('inserting deals');

  for (contract of MOCKS.DEALS) {
    const createdDeal = await api.createDeal(contract, tfmMakerToken);

    console.log('inserting deal facilites into central');

    for (facility of MOCKS.FACILITIES) {
      const createdFacility = await centralApi.createFacility(facility, createdDeal._id, tfmMakerToken);
      const facilityWithDealId = {
        ...facility,
        associatedDealId: createdDeal._id
      };
      await centralApi.updateFacility(createdFacility._id, facilityWithDealId, tfmMakerToken);
    }
  }
};

module.exports = insertMocks;
