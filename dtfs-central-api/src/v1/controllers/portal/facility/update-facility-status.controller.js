const { generateAuditDatabaseRecordFromAuditDetails, validateAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { MONGO_DB_COLLECTIONS, ApiError, InvalidFacilityIdError } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const { findOneFacility } = require('./get-facility.controller');
const { mongoDbClient: db } = require('../../../../drivers/db-client');

const withoutId = (obj) => {
  const cleanedObject = { ...obj };
  delete cleanedObject._id;
  return cleanedObject;
};

/**
 * Update a BSS/EWCS facility status
 * @param updateFacilityStatusParams
 * @param {string | ObjectId} updateFacilityStatusParams.facilityId - the facility Id
 * @param {import('@ukef/dtfs2-common').FacilityStatus} updateFacilityStatusParams.status - the new status to set
 * @param {import('@ukef/dtfs2-common').AuditDetails} updateFacilityStatusParams.auditDetails - the logged in users audit details
 * @returns {Promise<import('@ukef/dtfs2-common').Facility>} - the updated Facility
 */
const updateBssEwcsFacilityStatus = async ({ facilityId, status, auditDetails }) => {
  const existingFacility = await findOneFacility(facilityId);

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.FACILITIES);

  console.info('Updating Portal BSS/EWCS facility status to %s', status);
  const previousStatus = existingFacility.status;

  const auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

  const update = {
    ...existingFacility,
    updatedAt: Date.now(),
    previousStatus,
    status,
    auditRecord,
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate({ _id: { $eq: ObjectId(facilityId) } }, $.flatten(withoutId(update)), {
    returnNewDocument: true,
    returnDocument: 'after',
  });

  console.info('Updated Portal BSS/EWCS facility status from %s to %s', previousStatus, status);

  return findAndUpdateResponse.value;
};
exports.updateBssEwcsFacilityStatus = updateBssEwcsFacilityStatus;

exports.updateFacilityStatusPut = async (req, res) => {
  const {
    body: { status, auditDetails },
    params: { id: facilityId },
  } = req;

  try {
    if (!ObjectId.isValid(facilityId)) {
      throw new InvalidFacilityIdError(facilityId);
    }

    validateAuditDetails(auditDetails);

    const updatedFacility = await updateBssEwcsFacilityStatus({ facilityId, status, auditDetails });

    return res.status(200).json(updatedFacility);
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.status).send({
        status: error.status,
        message: error.message,
        code: error.code,
      });
    }

    console.error(`Error whilst updating facility status, ${error}`);

    return res.status(500).send({ status: 500, error });
  }
};
