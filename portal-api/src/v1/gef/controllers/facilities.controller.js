const { ObjectId } = require('mongodb');
const db = require('../../../drivers/db-client');
const utils = require('../utils.service');
const { facilitiesValidation, facilitiesStatus } = require('./validation/facilities');
const { Facility } = require('../models/facilities');

const collectionName = 'gef-facilities';

exports.create = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  const doc = await collection.insertOne(new Facility(req.body));
  res.status(201).json(doc.ops[0]);
};

exports.getAll = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  let find = {};
  if (req.query && req.query.applicationId) {
    find = { applicationId: ObjectId(String(req.query.applicationId)) };
  }
  const doc = await collection
    .find(find)
    .toArray();
  res.status(200).send({
    count: doc.length,
    data: doc,
  });
};

exports.getById = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  const doc = await collection.findOne({ _id: ObjectId(String(req.params.id)) });
  const response = {
    status: facilitiesStatus(doc),
    details: doc,
    validation: facilitiesValidation(doc),
  };
  res.status(200).send(response);
};

exports.update = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  const update = new Facility(req.body);
  const response = await collection.findOneAndUpdate(
    { _id: { $eq: ObjectId(String(req.params.id)) } }, { $set: update }, { returnOriginal: false },
  );
  res.status(utils.mongoStatus(response)).send({
    status: facilitiesStatus(response.value),
    details: response.value,
    validation: facilitiesValidation(response.value),
  });
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  let find;
  if (req.query && req.query.applicationId) {
    find = { applicationId: ObjectId(String(req.query.applicationId)) };
  } else {
    find = { _id: ObjectId(String(req.params.id)) };
  }
  const response = await collection.findOneAndDelete(find);
  res.status(utils.mongoStatus(response)).send(response.value);
};

exports.deleteByApplicationId = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  const response = await collection.deleteMany({ applicationId: ObjectId(String(req.query.applicationId)) });
  res.status(utils.mongoStatus(response)).send(response.value);
};
