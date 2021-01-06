const $ = require('mongo-dot-notation');
const { findOneFacility } = require('./get-facility.controller');
const db = require('../../../drivers/db-client');
const now = require('../../../now');

const withoutId = (obj) => {
  const cleanedObject = { ...obj };
  delete cleanedObject._id; // eslint-disable-line no-underscore-dangle
  return cleanedObject;
};

// TODO - currently in portal, when a facility is updated - deal is also updated with editedBy.
// should we do that here?
// do we have
const updateFacility = async (facilityId, facilityChanges) => {
  const collection = await db.getCollection('facilities');

  const update = {
    ...facilityChanges,
    lastEdited: now(),
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: facilityId },
    $.flatten(withoutId(update)),
    { returnOriginal: false },
  );

  const { value } = findAndUpdateResponse;

  return value;
};
exports.updateFacility = updateFacility;

exports.updateFacilityPut = async (req, res) => {
  const facilityId = req.params.id;

  await findOneFacility(facilityId, async (facility) => {
    if (!facility) res.status(404).send();

    if (facility) {
      const updatedFacility = await updateFacility(
        facilityId,
        req.body,
      );

      res.status(200).json(updatedFacility);
    }
    res.status(404).send();
  });
};
