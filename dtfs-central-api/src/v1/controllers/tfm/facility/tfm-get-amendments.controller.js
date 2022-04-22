const { ObjectId } = require('mongodb');
const db = require('../../../../drivers/db-client');

const findFacilitiesAmendmentsByDealId = async (_id) => {
  const collection = await db.getCollection('tfm-facilities');

  try {
    const facility = await collection.findOne({ _id: ObjectId(_id) });

    // returns amendments collection from facility
    return facility.amendments;
  } catch (err) {
    console.error('Unable to find amendments object', { err });
    return null;
  }
};
exports.findFacilitiesAmendmentsByDealId = findFacilitiesAmendmentsByDealId;

/**
 * returns whole amendment object/collection in object
 * includes status and history array
 * 200 if found or 400 if invalid facilityId
 */
exports.findFacilityAmendmentsGet = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const facilities = await findFacilitiesAmendmentsByDealId(req.params.id);
    if (facilities) {
      return res.status(200).send(facilities);
    }

    return res.status(404).send({ status: 404, message: 'Facility not found' });
  }
  return res.status(400).send({ status: 400, message: 'Invalid facility Id' });
};
