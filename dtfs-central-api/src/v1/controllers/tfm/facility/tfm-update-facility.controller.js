const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const { findOneFacility } = require('./tfm-get-facility.controller');
const db = require('../../../../drivers/db-client');

const withoutId = (obj) => {
  const cleanedObject = { ...obj };
  delete cleanedObject._id;
  return cleanedObject;
};

const updateFacility = async (facilityId, tfmUpdate) => {
  const collection = await db.getCollection('tfm-facilities');

  const update = {
    tfm: {
      ...tfmUpdate,
    },
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: { $eq: ObjectId(facilityId) } },
    $.flatten(withoutId(update)),
    { returnOriginal: false, upsert: true },
  );

  const { value: updatedFacility } = findAndUpdateResponse;

  return updatedFacility;
};
exports.updateFacility = updateFacility;

exports.updateFacilityPut = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const facilityId = req.params.id;

    const { facilityUpdate } = req.body;

    const facility = await findOneFacility(facilityId);

    if (facility) {
      const updatedFacility = await updateFacility(facilityId, facilityUpdate);

      return res.status(200).json(updatedFacility);
    }

    return res.status(404).send({ status: 404, message: 'Deal not found' });
  }
  return res.status(400).send({ status: 400, message: 'Invalid Facility Id' });
};
