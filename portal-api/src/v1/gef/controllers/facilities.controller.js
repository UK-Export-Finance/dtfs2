const { ObjectId } = require('mongodb');
const db = require('../../../drivers/db-client');
const utils = require('../utils.service');
const {
  facilitiesValidation, facilitiesStatus, facilitiesOverallStatus, facilitiesCheckEnums,
} = require('./validation/facilities');
const { Facility } = require('../models/facilities');

const collectionName = 'gef-facilities';

exports.create = async (req, res) => {
  const enumValidationErr = facilitiesCheckEnums(req.body);
  if (req.body.type && req.body.applicationId) {
    if (enumValidationErr) {
      res.status(422).send(enumValidationErr);
    } else {
      const collection = await db.getCollection(collectionName);
      const doc = await collection.insertOne(new Facility(req.body));
      const value = doc.ops[0];
      const response = {
        status: facilitiesStatus(value),
        details: value,
        validation: facilitiesValidation(value),
      };
      res.status(201).json(response);
    }
  } else {
    res.status(422).send([{ errCode: 'MANDATORY_FIELD', errMsg: 'No Application ID and/or facility type sent with request' }]);
  }
};

exports.getAll = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  let find = {};
  if (req.query && req.query.applicationId) {
    find = { applicationId: String(req.query.applicationId) };
  }
  const doc = await collection.find(find).toArray();

  const facilities = [];
  doc.forEach((item) => {
    facilities.push({
      status: facilitiesStatus(item),
      details: item,
      validation: facilitiesValidation(item),
    });
  });
  res.status(200).send({
    status: facilitiesOverallStatus(facilities),
    items: facilities,
  });
};

exports.getById = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  const doc = await collection.findOne({ _id: ObjectId(String(req.params.id)) });
  if (doc) {
    res.status(200).send({
      status: facilitiesStatus(doc),
      details: doc,
      validation: facilitiesValidation(doc),
    });
  } else {
    res.status(204).send();
  }
};

const calculateUkefExposure = (requestedUpdate, existingFacility) => {
  let latestValue = (existingFacility && existingFacility.value);
  let latestCoverPercentage = (existingFacility && existingFacility.coverPercentage);

  // make sure we calculate with the latest values.
  if (requestedUpdate.value) {
    latestValue = requestedUpdate.value;
  }

  if (requestedUpdate.coverPercentage) {
    latestCoverPercentage = requestedUpdate.coverPercentage;
  }

  const calculation = (latestValue * latestCoverPercentage);

  return calculation;
};
exports.calculateUkefExposure = calculateUkefExposure;

exports.update = async (req, res) => {
  const enumValidationErr = facilitiesCheckEnums(req.body);
  if (enumValidationErr) {
    res.status(422).send(enumValidationErr);
  } else {
    const collection = await db.getCollection(collectionName);
    const facilityId = ObjectId(String(req.params.id));

    const existingFacility = await collection.findOne({ _id: facilityId });

    const updateBody = {
      ...req.body,
      ukefExposure: calculateUkefExposure(req.body, existingFacility),
    };

    const update = new Facility(updateBody);

    const result = await collection.findOneAndUpdate(
      { _id: { $eq: facilityId } }, { $set: update }, { returnOriginal: false },
    );
    let response;
    if (result.value) {
      response = {
        status: facilitiesStatus(result.value),
        details: result.value,
        validation: facilitiesValidation(result.value),
      };
    }
    res.status(utils.mongoStatus(result)).send(response);
  }
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  const response = await collection.findOneAndDelete({ _id: ObjectId(String(req.params.id)) });
  res.status(utils.mongoStatus(response)).send(response.value ? response.value : null);
};

exports.deleteByApplicationId = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  const response = await collection.deleteMany({ applicationId: req.query.applicationId });
  res.status(200).send(response);
};
