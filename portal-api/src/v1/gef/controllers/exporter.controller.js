const { ObjectId } = require('mongodb');
const db = require('../../../drivers/db-client');
const utils = require('../utils.service');
const { exporterValidation } = require('./validation/exporter');
const { Exporter } = require('../models/exporter');

const collectionName = 'gef-exporter';

exports.getById = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  const doc = await collection.findOne({ _id: ObjectId(String(req.params.id)) });
  const exporter = {
    details: doc,
    validation: exporterValidation(doc),
  };
  res.status(200).send(exporter);
};

exports.update = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  const response = await collection.findOneAndUpdate(
    { _id: { $eq: ObjectId(String(req.params.id)) } }, { $set: new Exporter(req.body) }, { returnOriginal: false },
  );
  res.status(utils.mongoStatus(response)).send({
    details: response.value,
    validation: exporterValidation(response.value),
  });
};
