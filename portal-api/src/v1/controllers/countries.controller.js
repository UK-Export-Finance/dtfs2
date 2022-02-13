const utils = require('../../utils/array.util');

const refDataApi = require('../../reference-data/api');

const getCountryFromArray = (arr, code) => arr.filter((country) => country.code === code)[0];

const sortCountries = (countries) => {
  const countriesWithoutUK = countries.filter((country) => country.code !== 'GBR');

  const sortedArray = [
    getCountryFromArray(countries, 'GBR'),
    ...utils.sortArrayAlphabetically(countriesWithoutUK, 'name'),
  ];

  return sortedArray;
};

const findOneCountry = async (code) => {
  const country = await refDataApi.countries.getCountry(code);
  return country;
};

exports.findOneCountry = findOneCountry;

exports.findAll = async (req, res) => {
  const countries = await refDataApi.countries.getCountries();
  const sortedCountries = sortCountries(countries);
  res.status(200).send({
    count: sortedCountries.length,
    countries: sortedCountries,
  });
};

exports.findOne = async (req, res) => {
  const country = await findOneCountry(req.params.code);
  const status = country ? '200' : '404';

  res.status(status).send(country);
};
