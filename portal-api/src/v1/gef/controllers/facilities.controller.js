const { ObjectID } = require('mongodb');
const db = require('../../../drivers/db-client');
const utils = require('../utils.service');
const {
  facilitiesValidation, facilitiesStatus, facilitiesOverallStatus, facilitiesCheckEnums,
} = require('./validation/facilities');
const { Facility } = require('../models/facilities');
const { Application } = require('../models/application');
const { isSuperUser } = require('../../users/checks');
const {
  calculateUkefExposure,
  calculateGuaranteeFee,
} = require('../calculations/facility-calculations');

const collectionName = 'gef-facilities';
const dealsCollectionName = 'deals';

exports.create = async (req, res) => {
  const enumValidationErr = facilitiesCheckEnums(req.body);
  if (req.body.type && req.body.dealId) {
    if (enumValidationErr) {
      res.status(422).send(enumValidationErr);
    } else {
      const collection = await db.getCollection(collectionName);
      const createdFacility = await collection.insertOne(new Facility(req.body));

      const facility = await collection.findOne({
        _id: ObjectID(String(createdFacility.insertedId)),
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

const getAllFacilitiesByApplicationId = async (dealId) => {
  const collection = await db.getCollection(collectionName);
  let find = {};

  if (dealId) {
    find = { dealId: ObjectID(dealId) };
  }

  const doc = await collection.find(find).toArray();

  return doc;
};
exports.getAllFacilitiesByApplicationId = getAllFacilitiesByApplicationId;

exports.getAllGET = async (req, res) => {
  let doc;

  if (req.query && req.query.dealId) {
    doc = await getAllFacilitiesByApplicationId(req.query.dealId);
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
  const collection = await db.getCollection(collectionName);
  const doc = await collection.findOne({ _id: ObjectID(String(req.params.id)) });
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
  const collection = await db.getCollection(collectionName);
  const dealsCollection = await db.getCollection(dealsCollectionName);

  const facilityId = ObjectID(String(id));

  const existingFacility = await collection.findOne({ _id: facilityId });

  const facilityUpdate = new Facility({
    ...updateBody,
    ukefExposure: calculateUkefExposure(updateBody, existingFacility),
    guaranteeFee: calculateGuaranteeFee(updateBody, existingFacility),
  });

  const updatedFacility = await collection.findOneAndUpdate(
    { _id: { $eq: facilityId } }, { $set: facilityUpdate }, { returnOriginal: false },
  );

  if (existingFacility) {
    // update facilitiesUpdated timestamp in the deal
    const dealUpdateObj = {
      facilitiesUpdated: new Date().valueOf(),
    };
    const dealUpdate = new Application(dealUpdateObj);

    await dealsCollection.findOneAndUpdate(
      { _id: { $eq: ObjectID(existingFacility.dealId) } },
      { $set: dealUpdate },
      { returnOriginal: false },
    );
  }

  return updatedFacility;
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
  const response = await collection.findOneAndDelete({ _id: ObjectID(req.params.id) });
  res.status(utils.mongoStatus(response)).send(response.value ? response.value : null);
};

exports.deleteByApplicationId = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  const response = await collection.deleteMany({ dealId: req.query.dealId });
  res.status(200).send(response);
};

const facilitiesFilters = (user, filters = []) => {
  const amendedFilters = [...filters];

  // add the bank clause if we're not a superuser
  if (!isSuperUser(user)) { amendedFilters.push({ 'deal.bankId': { $eq: user.bank.id } }); }

  let result = {};
  if (amendedFilters.length === 1) {
    [result] = amendedFilters;
  } else if (amendedFilters.length > 1) {
    result = {
      $and: amendedFilters,
    };
  }

  return result;
};

exports.findFacilities = async (
  requestingUser,
  filters,
  start = 0,
  pagesize = 0,
) => {
  const sanitisedFilters = facilitiesFilters(requestingUser, filters);

  const collection = await db.getCollection(collectionName);

  const doc = await collection
    .aggregate([
      {
        $lookup: {
          from: 'deals',
          localField: 'dealId',
          foreignField: '_id',
          as: 'deal',
        },
      },
      { $unwind: '$deal' },
      { $match: sanitisedFilters },
      { $sort: { updatedAt: -1, createdAt: -1 } },
      {
        $facet: {
          count: [{ $count: 'total' }],
          facilities: [
            { $skip: start },
            ...(pagesize ? [{ $limit: pagesize }] : []),
          ],
        },
      },
      { $unwind: '$count' },
      { $project: { count: '$count.total', facilities: 1 } },
    ])
    .toArray();

  return doc;
};
