const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const { mongoDbClient: db } = require('../../../../drivers/db-client');

const findOneFacility = async (_id, callback) => {
  if (ObjectId.isValid(_id)) {
    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.FACILITIES);
    const facility = await collection.findOne({ _id: { $eq: ObjectId(_id) } });

    if (callback) {
      callback(facility);
    }

    return facility;
  }
  return { status: 400, message: 'Invalid Facility Id' };
};
exports.findOneFacility = findOneFacility;

exports.findOneFacilityGet = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const facility = await findOneFacility(req.params.id);

    if (facility) {
      return res.status(200).send(facility);
    }

    return res.status(404).send();
  }

  return res.status(400).send({ status: 400, message: 'Invalid Facility Id' });
};
