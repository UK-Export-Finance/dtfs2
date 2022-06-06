const utils = require('../../utils/array');
const refDataApi = require('../../reference-data/api');

const findOneCurrency = async (id) => refDataApi.currencies.getCurrency(id);
exports.findOneCurrency = findOneCurrency;

exports.findAll = async (req, res) => {
  const currencies = await refDataApi.currencies.getCurrencies();
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
