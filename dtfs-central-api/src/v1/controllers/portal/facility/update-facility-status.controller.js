const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const { findOneFacility } = require('./get-facility.controller');
const db = require('../../../../drivers/db-client');
const { DB_COLLECTIONS } = require('../../../../constants');
const { generatePortalUserAuditDetails } = require('../../../../helpers/generateAuditDetails');

const withoutId = (obj) => {
  const cleanedObject = { ...obj };
  delete cleanedObject._id;
  return cleanedObject;
};

const updateFacilityStatus = async (facilityId, status, existingFacility, userId) => {
  if (ObjectId.isValid(facilityId)) {
    const collection = await db.getCollection(DB_COLLECTIONS.FACILITIES);
    const auditDetails = generatePortalUserAuditDetails(userId);

    console.info('Updating Portal facility status to %s', status);
    const previousStatus = existingFacility.status;

    const update = {
      ...existingFacility,
      updatedAt: Date.now(),
      previousStatus,
      status,
      auditDetails,
    };

    const findAndUpdateResponse = await collection.findOneAndUpdate(
      { _id: { $eq: ObjectId(facilityId) } },
      $.flatten(withoutId(update)),
      { returnNewDocument: true, returnDocument: 'after' }
    );

    console.info('Updated Portal facility status from %s to %s', previousStatus, status);

    return findAndUpdateResponse.value;
  }
  return { status: 400, message: 'Invalid Facility Id' };
};
exports.updateFacilityStatus = updateFacilityStatus;

// eslint-disable-next-line consistent-return
exports.updateFacilityStatusPut = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const facilityId = req.params.id;

    const { status } = req.body;

    await findOneFacility(facilityId, async (existingFacility) => {
      if (existingFacility) {
        const updatedFacility = await updateFacilityStatus(
          facilityId,
          status,
          existingFacility,
        );
        return res.status(200).json(updatedFacility);
      }

      return res.status(404).send();
    });
  } else {
    return res.status(400).send({ status: 400, message: 'Invalid Facility Id' });
  }
};
