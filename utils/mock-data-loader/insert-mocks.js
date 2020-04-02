const api = require('./api');
const MOCKS = require('./mocks');

const tokenFor = require('./temporary-token-handler');

const insertMocks = async() => {
  const token = await tokenFor({
    username:'re-insert-mocks', password:'temporary',
    roles:['maker','editor'],
    bank: {
        id: "956",
        name: "Barclays Bank",
      }
  });

  console.log('inserting deals');
  for (contract of MOCKS.CONTRACTS) {
    api.createDeal(contract, token);
  }

  console.log('inserting banks');
  for (bank of MOCKS.BANKS) {
    api.createBank(bank, token);
  }

  console.log('inserting bond-currencies');
  for (bondCurrency of MOCKS.BOND_CURRENCIES) {
    api.createBondCurrency(bondCurrency, token);
  }

  console.log('inserting countries');
  for (country of MOCKS.COUNTRIES) {
    api.createCountry(country, token);
  }

  console.log('inserting industry-sectors');
  for (industrySector of MOCKS.INDUSTRY_SECTORS) {
    api.createIndustrySector(industrySector, token);
  }

  console.log('inserting mandatory-criteria');
  for (mandatoryCriteria of MOCKS.MANDATORY_CRITERIA) {
    api.createMandatoryCriteria(mandatoryCriteria, token);
  }

  console.log('inserting transactions');
  for (transaction of MOCKS.TRANSACTIONS) {
    api.createTransaction(transaction, token);
  }

  console.log('inserting users');
  for (user of MOCKS.USERS) {
    api.createUser(user);
  }

}

module.exports = insertMocks;
