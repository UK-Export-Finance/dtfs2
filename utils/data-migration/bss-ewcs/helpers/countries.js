const api = require('../api');

let countries;

const initCountries = async (token) => {
  countries = await api.listCountries(token);
  return countries;
};

const getCountryById = (countryId = '') => {
  const v2country = countries.find((c) => c.id.toString() === countryId.toString());
  if (!v2country) return {};
  const { _id, ...country } = v2country;
  return country;
};

module.exports = {
  initCountries,
  getCountryById,
};
