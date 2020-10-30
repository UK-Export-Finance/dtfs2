const { findOneCountry } = require('../../controllers/countries.controller');

module.exports.countryIsDisabled = (code) => {
  const country = findOneCountry(code);
  return country && country.disabled;
};
