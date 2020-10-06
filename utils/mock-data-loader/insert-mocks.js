const api = require('./api');
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

  console.log('inserting industry-sectors');
  for (industrySector of MOCKS.INDUSTRY_SECTORS) {
    await api.createIndustrySector(industrySector, token);
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
  for (contract of MOCKS.CONTRACTS) {
    await api.createDeal(contract, token);
  }

  // Add a deal from a different bank for testing
  console.log('inserting a deal from a different bank for testing');
  await api.createDeal(MOCKS.CONTRACTS[0], token2);
};

module.exports = insertMocks;
