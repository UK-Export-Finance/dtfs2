const utils = require('../../utils/array');
const COUNTRIES = require('../../reference-data/countries');

const getCountryFromArray = (arr, code) => arr.filter(
  (country) => country.code.toLowerCase() === code.toLowerCase(),
)[0];

const sortCountries = () => {
  const countriesWithoutUK = COUNTRIES.filter((country) => country.code !== 'GBR');

  const sortedArray = [
    getCountryFromArray(COUNTRIES, 'GBR'),
    ...utils.sortArrayAlphabetically(countriesWithoutUK, 'name'),
  ];

  return sortedArray;
};


const findOneCountry = (findCode) => COUNTRIES.find(({ code }) => code.toLowerCase() === findCode.toLowerCase());
exports.findOneCountry = findOneCountry;

exports.findAll = (req, res) => {
  const sortedCountries = sortCountries(COUNTRIES);
  res.status(200).send({
    count: sortedCountries.length,
    countries: sortedCountries,
  });
};

exports.findOne = (req, res) => {
  console.log('ref-data', req.params.code);
  const country = findOneCountry(req.params.code);
  const status = country ? '200' : '404';
  console.log({ country, status });
  res.status(status).send(country);
};
