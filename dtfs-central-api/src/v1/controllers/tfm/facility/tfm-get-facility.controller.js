const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const db = require('../../../../drivers/db-client').default;

const findOneFacility = async (_id, callback) => {
  if (!ObjectId.isValid(_id)) {
    return { status: 400, message: 'Invalid Facility Id' };
  }

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
  const facility = await collection.findOne({ _id: { $eq: ObjectId(_id) } });

  if (callback) {
    callback(facility);
  }

  return facility;
};
exports.findOneFacility = findOneFacility;

exports.findOneFacilityGet = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const facility = await findOneFacility(req.params.id);

    if (facility) {
      return res.status(200).send(facility);
    }

    return res.status(404).send({ status: 404, message: 'Facility not found' });
  }

  return res.status(400).send({ status: 400, message: 'Invalid Facility Id' });
};
