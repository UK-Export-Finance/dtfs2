const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const { findOneFacility } = require('./get-facility.controller');
const { updateDealEditedByPortal } = require('../deal/update-deal.controller');
const db = require('../../../../drivers/db-client');
const { PORTAL_ROUTE } = require('../../../../constants/routes');
const { DB_COLLECTIONS } = require('../../../../constants');
const { generatePortalUserAuditDetails } = require('../../../../helpers/generateAuditDetails');

const withoutId = (obj) => {
  const cleanedObject = { ...obj };
  delete cleanedObject._id;
  return cleanedObject;
};

const updateFacility = async (facilityId, facilityBody, dealId, user, routePath) => {
  if (ObjectId.isValid(dealId) && ObjectId.isValid(facilityId)) {
    const collection = await db.getCollection(DB_COLLECTIONS.FACILITIES);
    const auditDetails = generatePortalUserAuditDetails(user._id);

    const update = { ...facilityBody, dealId: ObjectId(dealId), updatedAt: Date.now(), auditDetails };

    const findAndUpdateResponse = await collection.findOneAndUpdate({ _id: { $eq: ObjectId(facilityId) } }, $.flatten(withoutId(update)), {
      returnNewDocument: true,
      returnDocument: 'after',
    });

    const { value: updatedFacility } = findAndUpdateResponse;

    if (routePath === PORTAL_ROUTE && user) {
      // update the deal so that the user that has edited this facility,
      // is also marked as editing the associated deal

      await updateDealEditedByPortal(dealId, user);
    }

    return updatedFacility;
  }
  return { status: 400, message: 'Invalid Deal or Facility Id' };
};
exports.updateFacility = updateFacility;

exports.updateFacilityPut = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).send({ status: 400, message: 'Invalid Facility Id' });
  }
  const facilityId = req.params.id;

  if (!req.body.user) {
    return res.status(400).send({ status: 400, message: 'User details are required' });
  }

  const { user } = req.body;

  delete req.body.user;
  const facilityUpdate = req.body;

  const facility = await findOneFacility(facilityId);

  if (facility) {
    const { dealId } = facility;

    const updatedFacility = await updateFacility(facilityId, facilityUpdate, dealId, user, req.routePath);

    return res.status(200).json(updatedFacility);
  }

  return res.status(404).send();
};
