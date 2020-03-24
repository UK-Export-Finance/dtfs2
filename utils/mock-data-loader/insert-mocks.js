const api = require('./api');
const MOCKS = require('./mocks');

const tokenFor = require('./temporary-token-handler');

const insertMocks = async() => {
  const token = await tokenFor({username:'script', password:'temporary', roles:['editor']});

  for (contract of MOCKS.CONTRACTS) {
    api.createDeal(contract);
  }

  for (bank of MOCKS.BANKS) {
    api.createBank(bank, token);
  }

  for (bondCurrency of MOCKS.BOND_CURRENCIES) {
    api.createBondCurrency(bondCurrency);
  }

  for (country of MOCKS.COUNTRIES) {
    api.createCountry(country);
  }

  for (industrySector of MOCKS.INDUSTRY_SECTORS) {
    api.createIndustrySector(industrySector);
  }

  for (mandatoryCriteria of MOCKS.MANDATORY_CRITERIA) {
    api.createMandatoryCriteria(mandatoryCriteria);
  }

  for (transaction of MOCKS.TRANSACTIONS) {
    api.createTransaction(transaction);
  }

  for (user of MOCKS.USERS) {
    api.createUser(user);
  }

}

module.exports = insertMocks;
