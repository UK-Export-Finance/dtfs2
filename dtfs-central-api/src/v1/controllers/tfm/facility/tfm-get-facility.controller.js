const { ObjectId } = require('mongodb');
const db = require('../../../../drivers/db-client');

const findOneFacility = async (_id, callback) => {
  const collection = await db.getCollection('tfm-facilities');
  const facility = await collection.findOne({ _id: ObjectId(_id) });

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

    return res.status(404).send({ status: 404, message: 'Deal not found' });
  }
  return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
};
