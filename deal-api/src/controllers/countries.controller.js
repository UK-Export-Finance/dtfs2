const assert = require('assert');

const db = require('../db-driver/client');

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
  findCountries(countries => res.status(200).send(countries))
);

exports.findOne = (req, res) => (
  findOneCountry(req.params.code, country => res.status(200).send(country))
);


exports.update = async (req, res) => {
  const collection = await db.getCollection('countries');
  const status = await collection.update({ code: req.params.code }, req.body);
  res.status(200).send(status);
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection('countries');
  const status = await collection.deleteOne({ code: req.params.code });
  res.status(200).send(status);
};
