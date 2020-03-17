const api = require('./api');
const MOCKS = require('./mocks');

const insertMocks = () => {
  for (contract of MOCKS.CONTRACTS) {
    api.createDeal(contract);
  }

  for (bank of MOCKS.BANKS) {
    api.createBank(bank);
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

}

module.exports = insertMocks;
