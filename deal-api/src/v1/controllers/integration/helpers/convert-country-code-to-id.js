const { findOneCountry } = require('../../countries.controller');

const convertCountryCodeToId = async (code) => {
  const country = await findOneCountry(code);
  return country ? country.id : code;
};

module.exports = convertCountryCodeToId;
