const api = require('./api');
const tokenFor = require('./temporary-token-handler');

const cleanBanks = async (token) => {
  console.log('cleaning banks');

  for (bank of await api.listBanks(token)) {
    await api.deleteBank(bank, token);
  }
};

const cleanCurrencies = async (token) => {
  console.log('cleaning currencies');

  for (currency of await api.listCurrencies(token)) {
    await api.deleteCurrency(currency, token);
  }
};

const cleanCountries = async (token) => {
  console.log('cleaning countries');

  for (country of await api.listCountries(token)) {
    await api.deleteCountry(country, token);
  }
};

const cleanDeals = async (token) => {
  console.log('cleaning deals');

  for (deal of await api.listDeals(token)) {
    await api.deleteDeal(deal, token);
  }
};

const cleanIndustrySectors = async (token) => {
  console.log('cleaning industry-sectors');

  for (industrySector of await api.listIndustrySectors(token)) {
    await api.deleteIndustrySector(industrySector, token);
  }
};

const cleanMandatoryCriteria = async (token) => {
  console.log('cleaning mandatory-criteria');

  for (mandatoryCriteria of await api.listMandatoryCriteria(token)) {
    await api.deleteMandatoryCriteria(mandatoryCriteria, token);
  }
};

const cleanUsers = async () => {
  console.log('cleaning users');

  for (user of await api.listUsers()) {
    await api.deleteUser(user);
  }
};

const cleanAllTables = async () => {
  const token = await tokenFor({
    username: 'admin',
    password: 'admin',
    roles: ['maker', 'editor'],
    bank: { id: '*' },
  });

  await cleanBanks(token);
  await cleanCurrencies(token);
  await cleanCountries(token);
  await cleanDeals(token);
  await cleanIndustrySectors(token);
  await cleanMandatoryCriteria(token);
  await cleanUsers();
};

module.exports = cleanAllTables;
