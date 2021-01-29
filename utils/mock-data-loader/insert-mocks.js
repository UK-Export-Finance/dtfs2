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
  let tfmBankDeal;

  for (contract of MOCKS.CONTRACTS) {
    const createdDeal = await api.createDeal(contract, token);
    if (contract.details.owningBank.useTFM) {
      tfmBankDeal = createdDeal;
    }
  }

  console.log('inserting facilites into central');
  const tfmMaker = MOCKS.USERS.find((user) => user.username === 'MAKER-TFM');

  for (facility of MOCKS.FACILITIES) {
    const createdFacility = await centralApi.createFacility(facility, tfmBankDeal._id, tfmMaker);
    const facilityWithDealId = {
      ...facility,
      associatedDealId: tfmBankDeal._id
    };
    await centralApi.updateFacility(createdFacility._id, facilityWithDealId, tfmMaker);
  }

  // Add a deal from a different bank for testing
  console.log('inserting a deal from a different bank for testing');
  await api.createDeal(MOCKS.CONTRACTS[0], token2);
};

module.exports = insertMocks;
