const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const { findOneFacility } = require('./get-facility.controller');
const { updateDealEditedByPortal } = require('../deal/update-deal.controller');
const db = require('../../../../database/mongo-client');
const { PORTAL_ROUTE } = require('../../../../constants/routes');

const withoutId = (obj) => {
  const cleanedObject = { ...obj };
  delete cleanedObject._id;
  return cleanedObject;
};

const updateBssFacility = async (facilityId, facilityBody, dealId, user, routePath) => {
  if (ObjectId.isValid(dealId) && ObjectId.isValid(facilityId)) {
    const collection = await db.getCollection('facilities');

    const update = { ...facilityBody, dealId: ObjectId(dealId), updatedAt: Date.now() };

    const findAndUpdateResponse = await collection.findOneAndUpdate(
      { _id: ObjectId(facilityId) },
      $.flatten(withoutId(update)),
      { returnDocument: 'after', returnNewDocument: true }
    );

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
exports.updateBssFacility = updateBssFacility;

exports.putBssFacility = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
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

      const updatedFacility = await updateBssFacility(facilityId, facilityUpdate, dealId, user, req.routePath);

      return res.status(200).json(updatedFacility);
    }

    return res.status(404).send();
  }
  return res.status(400).send({ status: 400, message: 'Invalid Facility Id' });
};

const updateGefFacility = async (id, updateBody) => {
  try {
    const facilitiesCollection = await db.getCollection('facilities');
    const dealsCollection = await db.getCollection('deals');

    let updatedFacility;

    const existingFacility = await facilitiesCollection.findOne({ _id: ObjectId(id) });

    if (existingFacility) {
      updatedFacility = await facilitiesCollection.findOneAndUpdate(
        { _id: ObjectId(id) },
        { $set: updateBody },
        { returnDocument: 'after', returnNewDocument: true }
      );
      if (updatedFacility) {
        // update facilitiesUpdated timestamp in the deal
        const dealUpdateObj = { facilitiesUpdated: new Date().valueOf() };

        await dealsCollection.updateOne(
          { _id: { $eq: ObjectId(existingFacility.dealId) } },
          { $set: dealUpdateObj },
        );
      }
    }

    return updatedFacility;
  } catch (e) {
    console.error('Unable to update the facility', { e });
    return e;
  }
};
exports.updateGefFacility = updateGefFacility;

exports.putGefFacility = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const facilityId = req.params.id;
    const facilityUpdate = req.body;

    const updatedFacility = await updateGefFacility(facilityId, facilityUpdate);

    if (updatedFacility) {
      return res.status(200).json(updatedFacility);
    }

    return res.status(404).send({ status: 404, message: 'The facility ID doesn\'t exist' });
  }
  return res.status(400).send({ status: 400, message: 'Invalid Facility Id' });
};
