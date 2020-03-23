const api = require('./api');

const cleanBanks = async () => {
  for (bank of await api.listBanks()) {
    api.deleteBank(bank);
  }
}

const cleanBondCurrencies = async () => {
  for (bondCurrency of await api.listBondCurrencies()) {
    api.deleteBondCurrency(bondCurrency);
  }
}

const cleanCountries = async () => {
  for (country of await api.listCountries()) {
    api.deleteCountry(country);
  }
}

const cleanDeals = async () => {
  for (deal of await api.listDeals()) {
    api.deleteDeal(deal);
  }
}

const cleanIndustrySectors = async () => {
  for (industrySector of await api.listIndustrySectors()) {
    api.deleteIndustrySector(industrySector);
  }
}

const cleanMandatoryCriteria = async () => {
  for (mandatoryCriteria of await api.listMandatoryCriteria()) {
    api.deleteMandatoryCriteria(mandatoryCriteria);
  }
}

const cleanTransactions = async () => {
  for (transaction of await api.listTransactions()) {
    api.deleteTransaction(transaction);
  }
}

const cleanUsers = async () => {
  for (user of await api.listUsers()) {
    api.deleteUser(user);
  }
}

const cleanAllTables = async () => {
  await cleanBanks();
  await cleanBondCurrencies();
  await cleanCountries();
  await cleanDeals();
  await cleanIndustrySectors();
  await cleanMandatoryCriteria();
  await cleanTransactions();
  await cleanUsers();
}

module.exports = cleanAllTables;
