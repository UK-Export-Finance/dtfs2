const utils = require('../../../utils/array');
const unsortedCountries = require('./countries');

const getCountryFromArray = (arr, code) => arr.filter((country) => country.code === code)[0];

module.exports = () => {
  const countriesWithoutUK = unsortedCountries.filter((country) => country.code !== 'GBR');
  const uk = getCountryFromArray(unsortedCountries, 'GBR');

  let sortedArray = [
    ...utils.sortArrayAlphabetically(countriesWithoutUK, 'name'),
  ];

  if (uk) {
    sortedArray = [
      uk,
      ...sortedArray,
    ];
  }

  return sortedArray;
};
