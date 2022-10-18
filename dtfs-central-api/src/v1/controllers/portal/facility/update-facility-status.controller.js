const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const { findOneFacility } = require('./get-facility.controller');
const db = require('../../../../database/mongo-client');

const withoutId = (obj) => {
  const cleanedObject = { ...obj };
  delete cleanedObject._id;
  return cleanedObject;
};

const updateFacilityStatus = async (facilityId, status, existingFacility) => {
  if (ObjectId.isValid(facilityId)) {
    const collection = await db.getCollection('facilities');

    const previousStatus = existingFacility.status;

    const update = {
      updatedAt: Date.now(),
      previousStatus,
      status,
    };

    const findAndUpdateResponse = await collection.findOneAndUpdate(
      { _id: ObjectId(facilityId) },
      $.flatten(withoutId(update)),
      { returnDocument: 'after', returnNewDocument: true }
    );

    console.info(`Updated Portal facility ${facilityId} status from ${previousStatus} to ${status}`);

    return findAndUpdateResponse.value;
  }
  return { status: 400, message: 'Invalid Facility Id' };
};
exports.updateFacilityStatus = updateFacilityStatus;

exports.updateFacilityStatusPut = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const facilityId = req.params.id;

    const { status } = req.body;

    await findOneFacility(facilityId, async (existingFacility) => {
      if (existingFacility) {
        if (existingFacility.status === status) {
          return res.status(200).send();
        }
        const updatedFacility = await updateFacilityStatus(facilityId, status, existingFacility);
        return res.status(200).json(updatedFacility);
      }

      return res.status(404).send();
    });
  } else {
    return res.status(400).send({ status: 400, message: 'Invalid Facility Id' });
  }
};
