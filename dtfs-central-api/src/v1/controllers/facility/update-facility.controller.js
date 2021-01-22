const $ = require('mongo-dot-notation');
const { findOneFacility } = require('./get-facility.controller');
const { updateDealEditedByPortal } = require('../deal/update-deal.controller');
const db = require('../../../drivers/db-client');
const now = require('../../../now');
const getUpdateFacilityErrors = require('../../validation/update-facility');
const { PORTAL_ROUTE } = require('../../../constants/routes');

const withoutId = (obj) => {
  const cleanedObject = { ...obj };
  delete cleanedObject._id; // eslint-disable-line no-underscore-dangle
  return cleanedObject;
};

const updateFacility = async (facilityId, facilityBody, routePath) => {
  const collection = await db.getCollection('facilities');

  const update = {
    ...facilityBody,
    lastEdited: now(),
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: facilityId },
    $.flatten(withoutId(update)),
    { returnOriginal: false },
  );

  const { value: updatedFacility } = findAndUpdateResponse;

  if (routePath === PORTAL_ROUTE) {
  // update the deal so that the user that has edited this facility,
  // is also marked as editing the associated deal
    const {
      associatedDealId,
      user,
    } = facilityBody;

    await updateDealEditedByPortal(associatedDealId, user);
  }


  return updatedFacility;
};
exports.updateFacility = updateFacility;

exports.updateFacilityPut = async (req, res) => {
  const facilityId = req.params.id;

  const { user, facility: facilityUpdate } = req.body;

  if (!user) {
    return res.status(400).send('User missing');
  }

  const validationErrors = getUpdateFacilityErrors(facilityUpdate);

  if (validationErrors.count !== 0) {
    return res.status(400).send({
      validationErrors,
    });
  }

  const facility = await findOneFacility(facilityId);

  if (facility) {
    const updatedFacility = await updateFacility(
      facilityId,
      req.body,
      req.routePath,
    );

    return res.status(200).json(updatedFacility);
  }

  return res.status(404).send();
};
