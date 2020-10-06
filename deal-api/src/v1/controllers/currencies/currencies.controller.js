const currencies = require('./sortedCurrencies')();

// left external interfaces the same since they're in use elsewhere..
//  could/should be simplified further
const findCurrencies = async () => currencies;
exports.findCurrencies = findCurrencies;

const findOneCurrency = async (id) => currencies.find((currency) => currency.id === id);
exports.findOneCurrency = findOneCurrency;

exports.findAll = async (req, res) => res.status(200).send({
  count: currencies.length,
  currencies,
});

exports.findOne = async (req, res) => {
  const currency = await findOneCurrency(req.params.id);
  return res.status(200).send(currency);
};
