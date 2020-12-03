const MOCK_COUNTRIES = require('./countries');
const MOCK_CURRENCIES = require('./currencies');
const MOCK_INDUSTRY_SECTORS = require('./industry-sectors');

const getCountries = () => MOCK_COUNTRIES;
const getCountry = (findCode) => MOCK_COUNTRIES.find(({ code }) => code === findCode);

const getCurrencies = () => MOCK_CURRENCIES;
const getCurrency = (findId) => MOCK_CURRENCIES.find(({ id }) => id === findId);

const getIndustrySectors = () => MOCK_INDUSTRY_SECTORS;
const getIndustrySector = (findCode) => MOCK_INDUSTRY_SECTORS.find(({ code }) => code === findCode);


module.exports = {
  countries: {
    getCountries,
    getCountry,
  },
  currencies: {
    getCurrencies,
    getCurrency,
  },
  industrySectors: {
    getIndustrySectors,
    getIndustrySector,
  },
};
