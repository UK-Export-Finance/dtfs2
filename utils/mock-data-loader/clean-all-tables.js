const api = require('./api');
const tokenFor = require('./temporary-token-handler');

const cleanBanks = async (token) => {
  for (bank of await api.listBanks(token)) {
    api.deleteBank(bank, token);
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
  const token = await tokenFor({username:'script', password:'temporary', roles:['editor']});

  await cleanBanks(token);
  await cleanBondCurrencies();
  await cleanCountries();
  await cleanDeals();
  await cleanIndustrySectors();
  await cleanMandatoryCriteria();
  await cleanTransactions();
  await cleanUsers();
}

module.exports = cleanAllTables;
