const assert = require('assert');
const db = require('../db-driver/client');
const utils = require('../utils/array');

const getCountryFromArray = (arr, code) => arr.filter((country) => country.code === code)[0];

const sortCountries = (arr, callback) => {
  const countriesWithoutUK = arr.filter((country) => country.code !== 'GBR');
  const uk = getCountryFromArray(arr, 'GBR');

  let sortedArray = [
    ...utils.sortArrayAlphabetically(countriesWithoutUK, 'code'),
  ];

  if (uk) {
    sortedArray = [
      uk,
      ...sortedArray,
    ];
  }

  return callback(sortedArray);
};

const findCountries = async (callback) => {
  const collection = await db.getCollection('countries');

  collection.find({}).toArray((err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

const findOneCountry = async (code, callback) => {
  const collection = await db.getCollection('countries');

  collection.findOne({ code }, (err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

exports.create = async (req, res) => {
  const collection = await db.getCollection('countries');
  const country = await collection.insertOne(req.body);

  res.status(200).send(country);
};

exports.findAll = (req, res) => (
  findCountries((countries) => sortCountries(countries, (sortedCountries) => res.status(200).send({
    count: sortedCountries.length,
    countries: sortedCountries,
  })))
);

exports.findOne = (req, res) => (
  findOneCountry(req.params.code, (country) => res.status(200).send(country))
);

exports.update = async (req, res) => {
  const collection = await db.getCollection('countries');
  const status = await collection.updateOne({ code: { $eq: req.params.code } }, { $set: req.body }, {});
  res.status(200).send(status);
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection('countries');
  const status = await collection.deleteOne({ code: req.params.code });
  res.status(200).send(status);
};
