const { ObjectId } = require('mongodb');
const db = require('../../../drivers/db-client');
const utils = require('../utils.service');
const {
  facilitiesValidation, facilitiesStatus, facilitiesOverallStatus, facilitiesCheckEnums,
} = require('./validation/facilities');
const { Facility } = require('../models/facilities');
const { Application } = require('../models/application');
const {
  calculateUkefExposure,
  calculateGuaranteeFee,
} = require('../calculations/facility-calculations');

const facilitiesCollectionName = 'facilities';
const dealsCollectionName = 'deals';

exports.create = async (req, res) => {
  const enumValidationErr = facilitiesCheckEnums(req.body);
  if (req.body.type && req.body.dealId) {
    if (enumValidationErr) {
      res.status(422).send(enumValidationErr);
    } else {
      const facilitiesQuery = await db.getCollection(facilitiesCollectionName);
      const createdFacility = await facilitiesQuery.insertOne(new Facility(req.body));

      const facility = await facilitiesQuery.findOne({
        _id: ObjectId(createdFacility.insertedId),
      });

      const response = {
        status: facilitiesStatus(facility),
        details: facility,
        validation: facilitiesValidation(facility),
      };
      res.status(201).json(response);
    }
  } else {
    res.status(422).send([{ errCode: 'MANDATORY_FIELD', errMsg: 'No Application ID and/or facility type sent with request' }]);
  }
};

const getAllFacilitiesByDealId = async (dealId) => {
  const collection = await db.getCollection(facilitiesCollectionName);
  let find = {};

  if (dealId) {
    find = { dealId: ObjectId(dealId) };
  }

  const doc = await collection.find(find).toArray();

  return doc;
};
exports.getAllFacilitiesByDealId = getAllFacilitiesByDealId;

exports.getAllGET = async (req, res) => {
  let doc;

  if (req.query && req.query.dealId) {
    doc = await getAllFacilitiesByDealId(req.query.dealId);
  }

  const facilities = [];

  if (doc && doc.length) {
    doc.forEach((item) => {
      facilities.push({
        status: facilitiesStatus(item),
        details: item,
        validation: facilitiesValidation(item),
      });
    });
  }

  res.status(200).send({
    status: facilitiesOverallStatus(facilities),
    items: facilities,
  });
};

exports.getById = async (req, res) => {
  const collection = await db.getCollection(facilitiesCollectionName);
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

const update = async (id, updateBody) => {
  try {
    const facilitiesQuery = await db.getCollection(facilitiesCollectionName);
    const dealsQuery = await db.getCollection(dealsCollectionName);

    const facilityId = ObjectId(String(id));
    const existingFacility = await facilitiesQuery.findOne({ _id: facilityId });
    const facilityUpdate = new Facility({
      ...updateBody,
      ukefExposure: calculateUkefExposure(updateBody, existingFacility),
      guaranteeFee: calculateGuaranteeFee(updateBody, existingFacility),
    });

    const updatedFacility = await facilitiesQuery.findOneAndUpdate(
      { _id: { $eq: facilityId } },
      { $set: facilityUpdate },
      { returnDocument: 'after', returnNewDocument: true }
    );

    if (existingFacility) {
    // update facilitiesUpdated timestamp in the deal
      const dealUpdateObj = {
        facilitiesUpdated: new Date().valueOf(),
      };
      const dealUpdate = new Application(dealUpdateObj);

      await dealsQuery.updateOne(
        { _id: { $eq: ObjectId(existingFacility.dealId) } },
        { $set: dealUpdate }
      );
    }
    return updatedFacility;
  } catch (e) {
    console.error('Unable to update the facility', { e });
    return e;
  }
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
  const collection = await db.getCollection(facilitiesCollectionName);
  const response = await collection.findOneAndDelete({ _id: ObjectId(req.params.id) });
  res.status(utils.mongoStatus(response)).send(response.value ? response.value : null);
};

exports.deleteByDealId = async (req, res) => {
  const collection = await db.getCollection(facilitiesCollectionName);
  const response = await collection.deleteMany({ dealId: req.query.dealId });
  res.status(200).send(response);
};
