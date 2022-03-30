const { ObjectId } = require('mongodb');
const { findOneFacility } = require('./get-facility.controller');
const db = require('../../../../drivers/db-client');

exports.deleteFacility = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const facilityId = req.params.id;

    await findOneFacility(facilityId, async (facility) => {
      if (facility) {
        const collection = await db.getCollection('facilities');
        const status = await collection.deleteOne({ _id: ObjectId(facilityId) });

        return res.status(200).send(status);
      }

      return res.status(404).send({ status: 400, message: 'Facility not found' });
    });
  } else {
    return res.status(400).send({ status: 400, message: 'Invalid Facility Id' });
  }
};
