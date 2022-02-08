const api = require('./api');
const tokenFor = require('./temporary-token-handler');
const latestCurrencies = require('./mocks/currencies');
const latestCountries = require('./mocks/countries');

const withoutMongoIds = (thingWithMongoId) => {
  const existingWithoutMongoId = { ...thingWithMongoId};
  delete(existingWithoutMongoId._id);
  return existingWithoutMongoId;
}


const matches = (existing, candidate) => {
  return JSON.stringify(withoutMongoIds(existing))===JSON.stringify(candidate);
}

const refreshCountries = async (token) => {
  const countriesUpdated = [];

  for (const existingCountry of await api.listCountries(token)) {
    const matchById = latestCountries.find( country => country.id === existingCountry.id );
    if (!matchById) {
      // existing currency has gone.. so we need to delete..
      console.info(`deleting from API as no longer found in reference data: ${JSON.stringify(existingCountry)}`)
      await api.deleteCountry(existingCountry, token);
    } else {
      if (!matches(existingCountry, matchById)) {
        console.info(`update: ${JSON.stringify(existingCountry)} -> ${JSON.stringify(matchById)}`);
        await api.updateCountry(matchById, token);
      }
    }
    countriesUpdated.push(withoutMongoIds(existingCountry));
  }

  const newlyAddedCountries = latestCountries.filter( newCountry => !countriesUpdated.find(entry=>entry.id = newCountry.id) )
  for (const newCountry of newlyAddedCountries) {
    console.info(`creating: ${JSON.stringify(newCountry)}`)
    await api.createCountry(newCountry, token);
  }

}

const refreshCurrencies = async (token) => {
  const currenciesUpdated = [];

  for (const existingCurrency of await api.listCurrencies(token)) {
    const matchById = latestCurrencies.find( currency => currency.id === existingCurrency.id );
    if (!matchById) {
      // existing currency has gone.. so we need to delete..
      console.info(`deleting from API as no longer found in reference data: ${JSON.stringify(existingCurrency)}`)
      await api.deleteCurrency(existingCurrency, token);
    } else {
      if (!matches(existingCurrency, matchById)) {
        console.info(`update: ${JSON.stringify(existingCurrency)} -> ${JSON.stringify(matchById)}`);
        await api.updateCurrency(matchById, token);
      }
    }
    currenciesUpdated.push(existingCurrency);
  }

  const newlyAddedCurrencies = latestCurrencies.filter( newCurrency => !currenciesUpdated.find(entry=>entry.currencyId === newCurrency.currencyId) )
  for (const newCurrency of newlyAddedCurrencies) {
    console.info(`creating: ${JSON.stringify(newCurrency)}`)
    await api.createCurrency(newCurrency, token);
  }

}

const refreshReferenceData = async () => {
  const token = await tokenFor({
    username: 'admin',
    password: 'AbC!2345',
    roles: ['maker', 'editor'],
    bank: { id: '*' },
  });

  await refreshCountries(token);
  await refreshCurrencies(token);
};

refreshReferenceData();
