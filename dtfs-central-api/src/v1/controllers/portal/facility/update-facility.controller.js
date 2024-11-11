const { generateAuditDatabaseRecordFromAuditDetails, validateAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { MONGO_DB_COLLECTIONS, ApiError } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const { findOneFacility } = require('./get-facility.controller');
const { updateDealEditedByPortal } = require('../deal/update-deal.controller');
const { mongoDbClient: db } = require('../../../../drivers/db-client');
const { ROUTES } = require('../../../../constants');

const withoutId = (obj) => {
  const cleanedObject = { ...obj };
  delete cleanedObject._id;
  return cleanedObject;
};

const updateFacility = async ({ facilityId, facilityUpdate, dealId, user, routePath, auditDetails }) => {
  if (!ObjectId.isValid(dealId) || !ObjectId.isValid(facilityId)) {
    return { status: 400, message: 'Invalid Deal or Facility Id' };
  }

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.FACILITIES);

  const auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

  const update = { ...facilityUpdate, dealId: ObjectId(dealId), updatedAt: Date.now(), auditRecord };

  const findAndUpdateResponse = await collection.findOneAndUpdate({ _id: { $eq: ObjectId(facilityId) } }, $.flatten(withoutId(update)), {
    returnNewDocument: true,
    returnDocument: 'after',
  });

  const { value: updatedFacility } = findAndUpdateResponse;

  if (routePath === ROUTES.PORTAL_ROUTE && user) {
    // update the deal so that the user that has edited this facility,
    // is also marked as editing the associated deal

    await updateDealEditedByPortal({ dealId, user, auditDetails });
  }

  return updatedFacility;
};
exports.updateFacility = updateFacility;

exports.updateFacilityPut = async (req, res) => {
  const {
    params: { id: facilityId },
    body: { user, facilityUpdate, auditDetails },
    routePath,
  } = req;

  try {
    validateAuditDetails(auditDetails);

    const facility = await findOneFacility(facilityId);

    const { dealId } = facility;

    const updatedFacility = await updateFacility({ facilityId, facilityUpdate, dealId, user, routePath, auditDetails });

    return res.status(200).json(updatedFacility);
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.status).send({
        status: error.status,
        message: error.message,
        code: error.code,
      });
    }

    console.error(`Error whilst updating facility, ${error}`);

    return res.status(500).send({ status: 500, message: 'An unknown error occurred' });
  }
};
