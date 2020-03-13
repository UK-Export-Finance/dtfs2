const assert = require('assert');

const db = require('../db-driver/client');

const findCountries = async (callback) => {
  const collection = await db.getCollection('countries');

  collection.find({}).toArray((err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

const findOneCountry = async (id, callback) => {
  const collection = await db.getCollection('countries');

  collection.findOne({ id }, (err, result) => {
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
  findCountries((countries) => res.status(200).send(countries))
);

exports.findOne = (req, res) => (
  findOneCountry(req.params.id, (country) => res.status(200).send(country))
);

exports.update = (req, res) => {};

exports.delete = (req, res) => {};
