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
    await api.createDeal(contract, token);
  }

  console.log('inserting banks');
  for (bank of MOCKS.BANKS) {
    await api.createBank(bank, token);
  }

  console.log('inserting bond-currencies');
  for (bondCurrency of MOCKS.BOND_CURRENCIES) {
    await api.createBondCurrency(bondCurrency, token);
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

  console.log('inserting transactions');
  for (transaction of MOCKS.TRANSACTIONS) {
    await api.createTransaction(transaction, token);
  }

  console.log('inserting users');
  for (user of MOCKS.USERS) {
    await api.createUser(user);
  }

}

module.exports = insertMocks;
