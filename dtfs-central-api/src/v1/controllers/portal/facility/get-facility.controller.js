const { ObjectId } = require('mongodb');
const db = require('../../../../database/mongo-client');

const findOneFacility = async (_id, callback) => {
  const collection = await db.getCollection('facilities');
  const facility = await collection.findOne({ _id: ObjectId(_id) });

  if (callback) {
    callback(facility);
  }

  return facility;
};
exports.findOneFacility = findOneFacility;

exports.findOneFacilityGet = async (req, res) => {
  const facility = await findOneFacility(req.params.id);

  if (facility) {
    return res.status(200).send(facility);
  }

  return res.status(404).send();
};
