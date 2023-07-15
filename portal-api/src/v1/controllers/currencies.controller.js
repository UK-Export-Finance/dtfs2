const utils = require('../../utils/array');
const externalApi = require('../../external-api/api');

const findOneCurrency = async (id) => externalApi.currencies.getCurrency(id);
exports.findOneCurrency = findOneCurrency;

exports.findAll = async (req, res) => {
  const currencies = await externalApi.currencies.getCurrencies();
  res.status(200).send({
    count: currencies.length,
    currencies: utils.sortArrayAlphabetically(currencies, 'id'),
  });
};

exports.findOne = async (req, res) => {
  const currency = await findOneCurrency(req.params.id);
  const status = currency ? 200 : 404;
  return res.status(status).send(currency);
};
