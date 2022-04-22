const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const { findFacilitiesAmendmentsByDealId } = require('./tfm-get-amendments.controller');
const { findOneFacility } = require('./tfm-get-facility.controller');

const db = require('../../../../drivers/db-client');

const withoutId = (obj) => {
  const cleanedObject = { ...obj };
  delete cleanedObject._id;
  return cleanedObject;
};

/**
 * creates amendments object in tfm-facilities
 * object blank history array
 */
const createAmendmentsObject = async (facilityId) => {
  const collection = await db.getCollection('tfm-facilities');

  // blank amendments object
  const amendmentsObject = {
    history: [],
  };
  try {
    const updatedAmendments = await collection.findOneAndUpdate({ _id: { $eq: ObjectId(facilityId) } }, $.flatten({ amendments: amendmentsObject }), {
      returnOriginal: false,
      upsert: true,
    });

    // returns amendments collection
    return updatedAmendments.value.amendments;
  } catch (err) {
    console.error('Error creating amendments collection', { err });
    return null;
  }
};

const createFacilityAmendments = async (facilityId, currentAmendments, amendment) => {
  const collection = await db.getCollection('tfm-facilities');
  const amendmentsUpdate = amendment;

  // creates and adds id to amendment object
  amendmentsUpdate.amendments._id = (new ObjectId()).toHexString();

  // pushes new object to history array
  currentAmendments.history.push(amendmentsUpdate.amendments);

  const update = {
    amendments: {
      history: currentAmendments.history,
    },
  };

  try {
    await collection.findOneAndUpdate(
      { _id: { $eq: ObjectId(facilityId) } },
      $.flatten(withoutId(update)),
      { returnOriginal: false, upsert: true },
    );

    // creates return object which includes newly created amendment and full amendments object
    const returnObj = {
      updated: {
        ...update,
      },
      createdAmendment: {
        ...amendmentsUpdate,
      },
    };

    return returnObj;
  } catch (err) {
    console.error('Unable to create amendment object', { err });
    return null;
  }
};
exports.createFacilityAmendments = createFacilityAmendments;

/**
 * creates amendment request object in histories array
 * returns 200 if worked
 * 404 if deal cannot be found
 * 400 if unable to create
 */
exports.updateFacilityAmendmentsCreate = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const facilityId = req.params.id;
    const { amendmentsUpdate } = req.body;

    // returns tfm-facility
    const currentFacility = await findOneFacility(facilityId);

    // checks if there is facility
    if (currentFacility) {
      const currentAmendments = await findFacilitiesAmendmentsByDealId(facilityId);
      // if amendments collection already exists
      if (currentAmendments) {
        const updatedAmendments = await createFacilityAmendments(facilityId, currentAmendments, amendmentsUpdate);
        return res.status(200).json(updatedAmendments);
      }
      // if amendments collection does not exist, then creates the collection and then adds to it
      const createdAmendmentsObject = await createAmendmentsObject(facilityId);
      if (createdAmendmentsObject) {
        const updatedAmendments = await createFacilityAmendments(facilityId, createdAmendmentsObject, amendmentsUpdate);
        return res.status(200).json(updatedAmendments);
      }
    }

    return res.status(404).send({ status: 404, message: 'Facility not found' });
  }
  return res.status(400).send({ status: 400, message: 'Unable to create amendments object' });
};

const updateFacilityAmendments = async (facilityId, amendmentsUpdate) => {
  const collection = await db.getCollection('tfm-facilities');

  const update = {
    amendments: {
      ...amendmentsUpdate,
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
exports.updateFacilityAmendments = updateFacilityAmendments;

exports.updateFacilityAmendmentsPut = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const facilityId = req.params.id;

    const { amendmentsUpdate } = req.body;

    const facilityAmendments = await findFacilitiesAmendmentsByDealId(facilityId);

    if (facilityAmendments) {
      const updatedFacility = await updateFacilityAmendments(facilityId, amendmentsUpdate);

      return res.status(200).json(updatedFacility);
    }

    return res.status(404).send({ status: 404, message: 'Deal not found' });
  }
  return res.status(400).send({ status: 400, message: 'Invalid amendment id' });
};
