const { ObjectId } = require('mongodb');
const {
  MONGO_DB_COLLECTIONS,
  DocumentNotDeletedError,
  DocumentNotFoundError,
  ApiError,
  DealNotFoundError,
  InvalidDealIdError,
  parseDealVersion,
} = require('@ukef/dtfs2-common');
const { generateAuditDatabaseRecordFromAuditDetails, generatePortalAuditDetails, deleteOne, deleteMany } = require('@ukef/dtfs2-common/change-stream');
const { mongoDbClient: db } = require('../../../drivers/db-client');
const utils = require('../utils.service');
const { facilitiesValidation, facilitiesStatus, facilitiesOverallStatus, facilitiesCheckEnums } = require('./validation/facilities');
const { Facility } = require('../models/facilities');
const { Application } = require('../models/application');
const { calculateUkefExposure, calculateGuaranteeFee } = require('../calculations/facility-calculations');
const { InvalidDatabaseQueryError } = require('../../errors/invalid-database-query.error');

exports.create = async (req, res) => {
  try {
    const enumValidationErr = facilitiesCheckEnums(req.body);
    if (!req.body.type || !req.body.dealId) {
      return res.status(422).send([{ status: 422, errCode: 'MANDATORY_FIELD', errMsg: 'No Application ID and/or facility type sent with request' }]);
    }

    if (enumValidationErr) {
      return res.status(422).send(enumValidationErr);
    }

    if (!ObjectId.isValid(req.body.dealId)) {
      throw new InvalidDealIdError(req.body.dealId);
    }

    const dealsCollection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);
    const existingDeal = await dealsCollection.findOne({ _id: { $eq: new ObjectId(req.body.dealId) } });

    if (!existingDeal) {
      throw new DealNotFoundError(req.body.dealId);
    }

    const auditDetails = generatePortalAuditDetails(req.user._id);

    const facilitiesCollection = await db.getCollection(MONGO_DB_COLLECTIONS.FACILITIES);

    const facilityParameters = { ...req.body, auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) };

    const facilityToInsert = new Facility(facilityParameters, parseDealVersion(existingDeal.version));
    const createdFacility = await facilitiesCollection.insertOne(facilityToInsert);

    const { insertedId } = createdFacility;

    const facility = await facilitiesCollection.findOne({
      _id: { $eq: ObjectId(insertedId) },
    });

    const response = {
      status: facilitiesStatus(facility),
      details: facility,
      validation: facilitiesValidation(facility, existingDeal.version),
    };
    return res.status(201).json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.status).send({ status: error.status, message: error.message });
    }
    throw error;
  }
};

const getAllFacilitiesByDealId = async (dealId) => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.FACILITIES);
  if (!dealId) {
    // TODO SR-8: This is required to preserve existing behaviour and allow tests to pass, but seems like a bug.
    return collection.find().toArray();
  }

  if (!ObjectId.isValid(dealId)) {
    throw new InvalidDatabaseQueryError('Invalid deal id');
  }
  const matchingFacilities = await collection.find({ dealId: { $eq: ObjectId(dealId) } }).toArray();

  return matchingFacilities;
};
exports.getAllFacilitiesByDealId = getAllFacilitiesByDealId;

exports.getAllGET = async (req, res) => {
  try {
    let doc;

    if (req.query && req.query.dealId) {
      try {
        doc = await getAllFacilitiesByDealId(req.query.dealId);
      } catch (error) {
        if (error instanceof InvalidDatabaseQueryError) {
          console.error(error);
          return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
        }

        throw error;
      }
    }

    const dealsCollection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);
    const existingDeal = await dealsCollection.findOne({ _id: { $eq: new ObjectId(req.query.dealId) } });

    if (!existingDeal) {
      throw new DealNotFoundError(req.query.dealId);
    }

    const facilities = [];

    if (doc && doc.length) {
      doc.forEach((facility) => {
        facilities.push({
          status: facilitiesStatus(facility, existingDeal.version),
          details: facility,
          validation: facilitiesValidation(facility, existingDeal.version),
        });
      });
    }

    return res.status(200).send({
      status: facilitiesOverallStatus(facilities),
      items: facilities,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.status).send({ status: error.status, message: error.message });
    }
    throw error;
  }
};

exports.getById = async (req, res) => {
  try {
    if (!ObjectId.isValid(String(req.params.id))) {
      return res.status(400).send({ status: 400, message: 'Invalid Facility Id' });
    }

    const facilitiesCollection = await db.getCollection(MONGO_DB_COLLECTIONS.FACILITIES);
    const facility = await facilitiesCollection.findOne({ _id: { $eq: ObjectId(String(req.params.id)) } });
    if (facility) {
      const dealsCollection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);
      const existingDeal = await dealsCollection.findOne({ _id: { $eq: new ObjectId(facility.dealId) } });

      if (!existingDeal) {
        throw new DealNotFoundError(facility.dealId);
      }

      return res.status(200).send({
        status: facilitiesStatus(facility),
        details: facility,
        validation: facilitiesValidation(facility, existingDeal.version),
      });
    }

    return res.status(204).send();
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.status).send({ status: error.status, message: error.message });
    }
    throw error;
  }
};

/**
 * @param {ObjectId | string} id - facility id to update
 * @param {Object} updateBody - update to make
 * @param {import("@ukef/dtfs2-common").AuditDetails} auditDetails - user making the request
 * @returns {Promise<import("mongodb").ModifyResult | false>} - Modify Result from the db operation or false if the facility or deal id are invalid
 * @throws {import("@ukef/dtfs2-common").DealVersionError} - if `dealVersion` is too low & `updateBody` has property `isUsingFacilityEndDate`
 * @throws {import("@ukef/dtfs2-common").InvalidParameterError} - if `isUsingFacilityEndDate` is not a boolean
 */
const update = async (id, updateBody, auditDetails) => {
  try {
    const facilitiesCollection = await db.getCollection(MONGO_DB_COLLECTIONS.FACILITIES);
    const dealsCollection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);

    const facilityId = ObjectId(String(id));

    if (!ObjectId.isValid(facilityId)) {
      throw new Error('Invalid Facility Id');
    }

    const existingFacility = await facilitiesCollection.findOne({ _id: { $eq: facilityId } });

    if (!existingFacility) {
      return { ok: true, value: existingFacility };
    }

    const existingDeal = await dealsCollection.findOne({ _id: { $eq: ObjectId(existingFacility.dealId) } });

    if (!existingDeal) {
      throw new Error('Facility `dealId` deal does not exist');
    }

    const facilityUpdate = new Facility(
      {
        ...updateBody,
        ukefExposure: calculateUkefExposure(updateBody, existingFacility),
        guaranteeFee: calculateGuaranteeFee(updateBody, existingFacility),
        auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
      },
      parseDealVersion(existingDeal.version),
    );

    const updatedFacility = await facilitiesCollection.findOneAndUpdate(
      { _id: { $eq: facilityId } },
      { $set: facilityUpdate },
      { returnNewDocument: true, returnDocument: 'after' },
    );

    if (existingFacility) {
      // update facilitiesUpdated timestamp in the deal
      const dealUpdateObj = {
        facilitiesUpdated: new Date().valueOf(),
        auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
      };
      const dealUpdate = new Application(dealUpdateObj);

      await dealsCollection.findOneAndUpdate(
        { _id: { $eq: ObjectId(existingFacility.dealId) } },
        { $set: dealUpdate },
        { returnNewDocument: true, returnDocument: 'after' },
      );
    }
    return updatedFacility;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Unable to update the facility %o', error);
    return false;
  }
};
exports.update = update;

exports.updatePUT = async (req, res) => {
  try {
    const enumValidationErr = facilitiesCheckEnums(req.body);
    if (enumValidationErr) {
      return res.status(422).send(enumValidationErr);
    }

    let response;

    const updatedFacility = await update(req.params.id, req.body, generatePortalAuditDetails(req.user._id));

    if (updatedFacility.value) {
      const dealsCollection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);
      const existingDeal = await dealsCollection.findOne({ _id: { $eq: new ObjectId(updatedFacility.value.dealId) } });

      if (!existingDeal) {
        throw new DealNotFoundError(updatedFacility.value.dealId);
      }

      response = {
        status: facilitiesStatus(updatedFacility.value),
        details: updatedFacility.value,
        validation: facilitiesValidation(updatedFacility.value, existingDeal.version),
      };
    }

    return res.status(utils.mongoStatus(updatedFacility)).send(response);
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.status).send({ status: error.status, message: error.message });
    }
    throw error;
  }
};

exports.delete = async (req, res) => {
  const auditDetails = generatePortalAuditDetails(req.user._id);

  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).send({ status: 400, message: 'Invalid Facility Id' });
  }

  try {
    const deleteOneResponse = await deleteOne({
      documentId: new ObjectId(req.params.id),
      collectionName: MONGO_DB_COLLECTIONS.FACILITIES,
      db,
      auditDetails,
    });

    return res.status(200).send(deleteOneResponse);
  } catch (error) {
    if (error instanceof DocumentNotDeletedError) {
      return res.sendStatus(404);
    }
    return res.status(500).send({ status: 500, error });
  }
};

exports.deleteByDealId = async (req, res) => {
  const { dealId } = req.query;
  const auditDetails = generatePortalAuditDetails(req.user._id);

  if (typeof dealId !== 'string') {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }

  try {
    const response = await deleteMany({
      filter: { dealId: { $eq: ObjectId(dealId) } },
      collectionName: MONGO_DB_COLLECTIONS.FACILITIES,
      db,
      auditDetails,
    });
    return res.status(200).send(response);
  } catch (error) {
    // This implimentation of returning 200 if the document is not found
    // is to preserve existing implimentation
    if (error instanceof DocumentNotFoundError) {
      return res.sendStatus(200);
    }
    console.error(error);
    return res.status(500).send({ status: 500, error });
  }
};
