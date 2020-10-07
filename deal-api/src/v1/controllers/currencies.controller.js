const db = require('../../drivers/db-client');
const utils = require('../../utils/array');

const findCurrencies = async () => {
  const collection = await db.getCollection('currencies');
  return collection.find({}).toArray();
};
exports.findCurrencies = findCurrencies;

const findOneCurrency = async (id) => {
  const collection = await db.getCollection('currencies');

  const currency = await collection.findOne({ id });
  return currency;
};
exports.findOneCurrency = findOneCurrency;

exports.create = async (req, res) => {
  const collection = await db.getCollection('currencies');
  const deal = await collection.insertOne(req.body);

  res.status(200).send(deal);
};

exports.findAll = async (req, res) => {
  const currencies = await findCurrencies();
  res.status(200).send({
    count: currencies.length,
    currencies: utils.sortArrayAlphabetically(currencies, 'id'),
  });
};

exports.findOne = async (req, res) => {
  const currency = await findOneCurrency(req.params.id);
  return res.status(200).send(currency);
};

exports.update = async (req, res) => {
  const collection = await db.getCollection('currencies');
  const status = await collection.updateOne({ id: { $eq: req.params.id } }, { $set: req.body }, {});
  res.status(200).send(status);
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection('currencies');
  const status = await collection.deleteOne({ id: req.params.id });
  res.status(200).send(status);
};
