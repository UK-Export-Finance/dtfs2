const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const { InvalidAuditDetailsError } = require('@ukef/dtfs2-common/errors');
const { validateAuditDetails, generateAuditDatabaseRecordFromAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const { findOneFacility } = require('./tfm-get-facility.controller');
const db = require('../../../../drivers/db-client').default;

const withoutId = (obj) => {
  const cleanedObject = { ...obj };
  delete cleanedObject._id;
  return cleanedObject;
};

const updateFacility = async ({ facilityId, tfmUpdate, auditDetails }) => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES);

  const update = {
    tfm: {
      ...tfmUpdate,
    },
    auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate({ _id: { $eq: ObjectId(facilityId) } }, $.flatten(withoutId(update)), {
    returnNewDocument: true,
    returnDocument: 'after',
    upsert: true,
  });

  const { value: updatedFacility } = findAndUpdateResponse;

  return updatedFacility;
};

exports.updateFacilityPut = async (req, res) => {
  const facilityId = req.params.id;
  if (!ObjectId.isValid(facilityId)) {
    return res.status(400).send({ status: 400, message: 'Invalid Facility Id' });
  }

  const facility = await findOneFacility(facilityId);

  if (!facility) {
    return res.status(404).send({ status: 404, message: 'Facility not found' });
  }

  const { tfmUpdate, auditDetails } = req.body;

  try {
    validateAuditDetails(auditDetails);
  } catch (error) {
    if (error instanceof InvalidAuditDetailsError) {
      return res.status(error.status).send({
        status: error.status,
        message: `Invalid auditDetails, ${error.message}`,
      });
    }
    return res.status(500).send({ status: 500, error });
  }

  const updatedFacility = await updateFacility({
    facilityId,
    tfmUpdate,
    auditDetails,
  });

  return res.status(200).json(updatedFacility);
};
