const utils = require('../../utils/array');

const externalApi = require('../../external-api/api');

const getCountryFromArray = (arr, code) => arr.filter((country) => country.code === code)[0];

const sortCountries = (countries) => {
  const countriesWithoutUK = countries.filter((country) => country.code !== 'GBR');

  const sortedArray = [getCountryFromArray(countries, 'GBR'), ...utils.sortArrayAlphabetically(countriesWithoutUK, 'name')];

  return sortedArray;
};

const findOneCountry = async (code) => {
  const response = await externalApi.countries.getCountry(code);
  return response;
};

exports.findOneCountry = findOneCountry;

exports.findAll = async (req, res) => {
  const countries = await externalApi.countries.getCountries();
  const sortedCountries = sortCountries(countries);
  res.status(200).send({
    count: sortedCountries.length,
    countries: sortedCountries,
  });
};

exports.findOne = async (req, res) => {
  const response = await findOneCountry(req.params.code);

  const { status, data } = response;

  if (data) {
    return res.status(status).send(data);
  }

  return res.status(status).send({});
};
