const countryController = require('../../countries.controller');

const convertCountryCodeToId = (code) => {
  const country = countryController.findOneCountry(code);
  return country ? country.id : code;
};

module.exports = convertCountryCodeToId;
