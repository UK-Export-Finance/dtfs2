const { generateAuditDatabaseRecordFromAuditDetails, validateAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { MONGO_DB_COLLECTIONS, InvalidParameterError, ApiError, InvalidFacilityIdError } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const { findOneFacility } = require('./get-facility.controller');
const { mongoDbClient: db } = require('../../../../drivers/db-client');

const withoutId = (obj) => {
  const cleanedObject = { ...obj };
  delete cleanedObject._id;
  return cleanedObject;
};

const updateFacilityStatus = async ({ facilityId, status, auditDetails }) => {
  const existingFacility = await findOneFacility(facilityId);

  if (existingFacility.status === 400) {
    throw new InvalidParameterError('facilityId', facilityId);
  }

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.FACILITIES);

  console.info('Updating Portal facility status to %s', status);
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

  console.info('Updated Portal facility status from %s to %s', previousStatus, status);

  return findAndUpdateResponse.value;
};
exports.updateFacilityStatus = updateFacilityStatus;

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

    const updatedFacility = await updateFacilityStatus({ facilityId, status, auditDetails });

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
