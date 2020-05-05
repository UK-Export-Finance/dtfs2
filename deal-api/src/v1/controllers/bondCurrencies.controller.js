const db = require('../../drivers/db-client');
const utils = require('../../utils/array');

const findBondCurrencies = async () => {
  const collection = await db.getCollection('bondCurrencies');
  return collection.find({}).toArray();
};
exports.findBondCurrencies = findBondCurrencies;

const findOneBondCurrency = async (id) => {
  const collection = await db.getCollection('bondCurrencies');

  const currency = await collection.findOne({ id });
  return currency;
};
exports.findOneBondCurrency = findOneBondCurrency;

exports.create = async (req, res) => {
  const collection = await db.getCollection('bondCurrencies');
  const deal = await collection.insertOne(req.body);

  res.status(200).send(deal);
};

exports.findAll = async (req, res) => {
  const bondCurrencies = await findBondCurrencies();
  res.status(200).send({
    count: bondCurrencies.length,
    bondCurrencies: utils.sortArrayAlphabetically(bondCurrencies, 'id'),
  });
};

exports.findOne = async (req, res) => {
  const bondCurrency = await findOneBondCurrency(req.params.id);
  return res.status(200).send(bondCurrency);
};

exports.update = async (req, res) => {
  const collection = await db.getCollection('bondCurrencies');
  const status = await collection.updateOne({ id: { $eq: req.params.id } }, { $set: req.body }, {});
  res.status(200).send(status);
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection('bondCurrencies');
  const status = await collection.deleteOne({ id: req.params.id });
  res.status(200).send(status);
};
