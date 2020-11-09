const MOCK_COUNTRIES = require('./countries');


const getCountries = () => MOCK_COUNTRIES;

const getCountry = (findCode) => MOCK_COUNTRIES.find(({ code }) => code === findCode);

module.exports = {
  getCountries,
  getCountry,
};
