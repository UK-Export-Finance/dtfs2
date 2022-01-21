const $ = require('mongo-dot-notation');
const { findOneFacility } = require('./get-facility.controller');
const { updateDealEditedByPortal } = require('../deal/update-deal.controller');
const db = require('../../../../drivers/db-client');
const now = require('../../../../now');
const { PORTAL_ROUTE } = require('../../../../constants/routes');

const withoutId = (obj) => {
  const cleanedObject = { ...obj };
  delete cleanedObject._id;
  return cleanedObject;
};

const updateFacility = async (facilityId, facilityBody, dealId, user, routePath) => {
  const collection = await db.getCollection('facilities');

  const update = {
    ...facilityBody,
    updatedAt: now(),
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: facilityId },
    $.flatten(withoutId(update)),
    { returnOriginal: false },
  );

  const { value: updatedFacility } = findAndUpdateResponse;

  if (routePath === PORTAL_ROUTE && user) {
    // update the deal so that the user that has edited this facility,
    // is also marked as editing the associated deal

    await updateDealEditedByPortal(dealId, user);
  }

  return updatedFacility;
};
exports.updateFacility = updateFacility;

exports.updateFacilityPut = async (req, res) => {
  const facilityId = req.params.id;

  let facilityUpdate;
  let user;

  if (req.body.user) {
    user = req.body.user;

    delete req.body.user;
    facilityUpdate = req.body;
  } else {
    facilityUpdate = req.body;
  }

  const facility = await findOneFacility(facilityId);

  if (facility) {
    const { dealId } = facility;

    const updatedFacility = await updateFacility(
      facilityId,
      facilityUpdate,
      dealId,
      user,
      req.routePath,
    );

    return res.status(200).json(updatedFacility);
  }

  return res.status(404).send();
};
