const utils = require('../../utils/array');
const CURRENCIES = require('../../reference-data/currencies');

const findOneCurrency = (id) => CURRENCIES.find((c) => c.id.toLowerCase() === id.toLowerCase());
exports.findOneCurrency = findOneCurrency;

exports.findAll = (req, res) => {
  res.status(200).send({
    count: CURRENCIES.length,
    currencies: utils.sortArrayAlphabetically(CURRENCIES, 'id'),
  });
};

exports.findOne = (req, res) => {
  const currency = findOneCurrency(req.params.id);
  const status = currency ? '200' : '404';
  return res.status(status).send(currency);
};
