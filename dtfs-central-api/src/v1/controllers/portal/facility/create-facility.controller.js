const { validateAuditDetails, generateAuditDatabaseRecordFromAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { MONGO_DB_COLLECTIONS, InvalidAuditDetailsError } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const { mongoDbClient: db } = require('../../../../drivers/db-client');
const getCreateFacilityErrors = require('../../../validation/create-facility');
const { findOneDeal } = require('../deal/get-deal.controller');
const { addFacilityIdToDeal } = require('../deal/update-deal.controller');

const createFacility = async (facility, user, routePath, auditDetails) => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.FACILITIES);

  const { dealId } = facility;
  const auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

  const newFacility = {
    ...facility,
    dealId: new ObjectId(facility.dealId),
    createdDate: Date.now(),
    updatedAt: Date.now(),
    auditRecord,
  };

  const response = await collection.insertOne(newFacility);
  const { insertedId } = response;

  await addFacilityIdToDeal(dealId, insertedId, user, routePath, auditDetails);

  return { _id: insertedId };
};

exports.createFacilityPost = async (req, res) => {
  const { facility, user, auditDetails } = req.body;

  if (!user) {
    return res.status(404).send();
  }

  if (typeof facility?.type !== 'string') {
    return res.status(400).send({ status: 400, message: 'Invalid facility payload' });
  }

  const validationErrors = getCreateFacilityErrors(facility);

  if (validationErrors.count !== 0) {
    return res.status(400).send({
      validationErrors,
    });
  }

  try {
    validateAuditDetails(auditDetails);
  } catch (error) {
    if (error instanceof InvalidAuditDetailsError) {
      return res.status(error.status).send({
        status: error.status,
        message: error.message,
        code: error.code,
      });
    }
    return res.status(500).send({ status: 500, error });
  }

  const deal = await findOneDeal(facility.dealId);

  if (!deal) {
    return res.status(404).send('Deal not found');
  }

  const createdFacility = await createFacility(facility, user, req.routePath, auditDetails);

  return res.status(200).send(createdFacility);
};
