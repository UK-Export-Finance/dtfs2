const { ObjectId } = require('mongodb');
const db = require('../../../drivers/db-client');
const utils = require('../utils.service');
const { exporterValidation, exporterStatus, exporterCheckEnums } = require('./validation/exporter');
const { Exporter } = require('../models/exporter');

const collectionName = 'gef-exporter';

exports.getById = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  const doc = await collection.findOne({ _id: ObjectId(String(req.params.id)) });
  if (doc) {
    const response = {
      status: exporterStatus(doc),
      details: doc,
      validation: exporterValidation(doc),
    };
    res.status(200).send(response);
  } else {
    res.status(204).send();
  }
};

exports.update = async (req, res) => {
  const enumValidationErr = exporterCheckEnums(req.body);
  if (enumValidationErr) {
    res.status(422).send(enumValidationErr);
  } else {
    const collection = await db.getCollection(collectionName);
    const result = await collection.findOneAndUpdate(
      { _id: { $eq: ObjectId(String(req.params.id)) } }, { $set: new Exporter(req.body) }, { returnDocument: 'after', returnOriginal: false },
    );
    let response;
    if (result.value) {
      response = {
        status: exporterStatus(result.value),
        details: result.value,
        validation: exporterValidation(result.value),
      };
    }
    res.status(utils.mongoStatus(result)).send(response);
  }
};
