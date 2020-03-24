const api = require('./api');
const tokenFor = require('./temporary-token-handler');

const cleanBanks = async (token) => {
  console.log('cleaning banks');

  for (bank of await api.listBanks(token)) {
    api.deleteBank(bank, token);
  }
}

const cleanBondCurrencies = async (token) => {
  console.log('cleaning bond-currencies');

  for (bondCurrency of await api.listBondCurrencies(token)) {
    api.deleteBondCurrency(bondCurrency, token);
  }
}

const cleanCountries = async (token) => {
  console.log('cleaning countries');

  for (country of await api.listCountries(token)) {
    api.deleteCountry(country, token);
  }
}

const cleanDeals = async (token) => {
  console.log('cleaning deals');

  for (deal of await api.listDeals(token)) {
    api.deleteDeal(deal, token);
  }
}

const cleanIndustrySectors = async (token) => {
  console.log('cleaning industry-sectors');

  for (industrySector of await api.listIndustrySectors(token)) {
    api.deleteIndustrySector(industrySector, token);
  }
}

const cleanMandatoryCriteria = async (token) => {
  console.log('cleaning mandatory-criteria');

  for (mandatoryCriteria of await api.listMandatoryCriteria(token)) {
    api.deleteMandatoryCriteria(mandatoryCriteria, token);
  }
}

const cleanTransactions = async (token) => {
  console.log('cleaning transactions');

  for (transaction of await api.listTransactions(token)) {
    api.deleteTransaction(transaction, token);
  }
}

const cleanUsers = async () => {
  console.log('cleaning users');

  for (user of await api.listUsers()) {
    api.deleteUser(user);
  }
}

const cleanAllTables = async () => {
  const token = await tokenFor({username:'script', password:'temporary', roles:['editor']});

  await cleanBanks(token);
  await cleanBondCurrencies(token);
  await cleanCountries(token);
  await cleanDeals(token);
  await cleanIndustrySectors(token);
  await cleanMandatoryCriteria(token);
  await cleanTransactions(token);
  await cleanUsers();
}

module.exports = cleanAllTables;
