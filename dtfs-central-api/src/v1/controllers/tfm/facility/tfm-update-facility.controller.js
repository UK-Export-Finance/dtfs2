const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const { generateTfmUserAuditDetails, generateSystemAuditDetails } = require('@ukef/dtfs2-common/src/helpers/changeStream/generateAuditDetails');
const { findOneFacility } = require('./tfm-get-facility.controller');
const db = require('../../../../drivers/db-client');
const { DB_COLLECTIONS } = require('../../../../constants');

const withoutId = (obj) => {
  const cleanedObject = { ...obj };
  delete cleanedObject._id;
  return cleanedObject;
};

const updateFacility = async (facilityId, tfmUpdate, sessionUser, options = {}) => {
  const collection = await db.getCollection(DB_COLLECTIONS.TFM_FACILITIES);

  const update = {
    tfm: {
      ...tfmUpdate,
    },
  };

  const queryWithoutAuditDetails = $.flatten(withoutId(update));
  const query = {
    ...queryWithoutAuditDetails,
    $set: {
      ...queryWithoutAuditDetails.$set,
      auditDetails: options.isSystemUpdate ? generateSystemAuditDetails() : generateTfmUserAuditDetails(sessionUser._id),
    },
  }

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: { $eq: ObjectId(facilityId) } },
    query,
    { returnNewDocument: true, returnDocument: 'after', upsert: true },
  );

  const { value: updatedFacility } = findAndUpdateResponse;

  return updatedFacility;
};

exports.updateFacilityPut = async (req, res) => {
  const facilityId = req.params.id;
  if(!ObjectId.isValid(facilityId)) {
    return res.status(400).send({ status: 400, message: 'Invalid Facility Id' });
  }
  const { facilityUpdate, user, options } = req.body;

  const facility = await findOneFacility(facilityId);

  if (!facility) {
    return res.status(404).send({ status: 404, message: 'Deal not found' });
  }

  const updatedFacility = await updateFacility(facilityId, facilityUpdate, user, options);

  return res.status(200).json(updatedFacility);
};
