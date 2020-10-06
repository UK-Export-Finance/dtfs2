const utils = require('../../../utils/array');
const unsortedCurrencies = require('./currencies');

module.exports = () => {
  const sortedCurrencies = utils.sortArrayAlphabetically(unsortedCurrencies, 'id');
  return sortedCurrencies;
};
