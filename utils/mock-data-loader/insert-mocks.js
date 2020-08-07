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

  console.log('inserting deals');
  for (contract of MOCKS.CONTRACTS) {
    await api.createDeal(contract, token);
  }

  // Add a deal from a different bank for testing
  await api.createDeal(MOCKS.CONTRACTS[0], token2);

  console.log('inserting banks');
  for (bank of MOCKS.BANKS) {
    await api.createBank(bank, token);
  }

  console.log('inserting currencies');
  for (currency of MOCKS.CURRENCIES) {
    await api.createCurrency(currency, token);
  }

  console.log('inserting countries');
  for (country of MOCKS.COUNTRIES) {
    await api.createCountry(country, token);
  }

  console.log('inserting industry-sectors');
  for (industrySector of MOCKS.INDUSTRY_SECTORS) {
    await api.createIndustrySector(industrySector, token);
  }

  console.log('inserting mandatory-criteria');
  for (mandatoryCriteria of MOCKS.MANDATORY_CRITERIA) {
    await api.createMandatoryCriteria(mandatoryCriteria, token);
  }

  console.log('inserting users');
  for (user of MOCKS.USERS) {
    await api.createUser(user);
  }
};

module.exports = insertMocks;
