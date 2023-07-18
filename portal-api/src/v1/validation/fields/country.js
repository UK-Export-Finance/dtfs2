const { findOneCountry } = require('../../controllers/countries.controller');

module.exports.countryIsDisabled = (code) => {
  const { data: country } = findOneCountry(code);
  return country && country.disabled;
};
