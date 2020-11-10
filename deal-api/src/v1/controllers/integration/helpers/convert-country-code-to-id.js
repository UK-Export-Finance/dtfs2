const countryController = require('../../countries.controller');

const convertCountryCodeToId = async (code) => {
  const country = await countryController.findOneCountry(code);
  return country ? country.id : code;
};

module.exports = convertCountryCodeToId;
