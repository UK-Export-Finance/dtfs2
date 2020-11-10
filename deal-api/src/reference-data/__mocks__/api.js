const MOCK_COUNTRIES = require('./countries');
const MOCK_CURRENCIES = require('./currencies');

const getCountries = () => MOCK_COUNTRIES;
const getCountry = (findCode) => MOCK_COUNTRIES.find(({ code }) => code === findCode);

const getCurrencies = () => MOCK_CURRENCIES;
const getCurrency = (findId) => MOCK_CURRENCIES.find(({ id }) => id === findId);


module.exports = {
  countries: {
    getCountries,
    getCountry,
  },
  currencies: {
    getCurrencies,
    getCurrency,
  },
};
