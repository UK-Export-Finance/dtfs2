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

const getAllFacilitiesByApplicationId = async (applicationId) => {
  const collection = await db.getCollection(collectionName);
  let find = {};

  if (applicationId) {
    find = { applicationId: String(applicationId) };
  }

  const doc = await collection.find(find).toArray();

  return doc;
};
exports.getAllFacilitiesByApplicationId = getAllFacilitiesByApplicationId;

exports.getAllGET = async (req, res) => {
  let doc;

  if (req.query && req.query.applicationId) {
    doc = await getAllFacilitiesByApplicationId(req.query.applicationId);
  }

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

const update = async (id, updateBody) => {
  const collection = await db.getCollection(collectionName);
  const facilityId = ObjectId(String(id));

  const existingFacility = await collection.findOne({ _id: facilityId });

  const facilityUpdate = new Facility({
    ...updateBody,
    ukefExposure: calculateUkefExposure(updateBody, existingFacility),
  });

  const result = await collection.findOneAndUpdate(
    { _id: { $eq: facilityId } }, { $set: facilityUpdate }, { returnOriginal: false },
  );

  return result;
};
exports.update = update;

exports.updatePUT = async (req, res) => {
  const enumValidationErr = facilitiesCheckEnums(req.body);
  if (enumValidationErr) {
    res.status(422).send(enumValidationErr);
  } else {
    let response;
    const updatedFacility = await update(req.params.id, req.body);

    if (updatedFacility.value) {
      response = {
        status: facilitiesStatus(updatedFacility.value),
        details: updatedFacility.value,
        validation: facilitiesValidation(updatedFacility.value),
      };
    }

    res.status(utils.mongoStatus(updatedFacility)).send(response);
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
