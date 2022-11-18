const { ObjectId } = require('mongodb');
const { findOneFacility } = require('./get-facility.controller');
const { removeFacilityIdFromDeal } = require('../deal/update-deal.controller');
const db = require('../../../../database/mongo-client');

exports.deleteFacility = async (req, res) => {
  const facilityId = req.params.id;

  await findOneFacility(facilityId, async (facility) => {
    if (facility) {
      const collection = await db.getCollection('facilities');
      const status = await collection.deleteOne({ _id: ObjectId(facilityId) });

      const { user } = req.body;

      // remove facility ID from the associated deal
      await removeFacilityIdFromDeal(facility.dealId, facilityId, user, req.routePath);

      return res.status(200).send(status);
    }

    return res.status(404).send({ status: 400, message: 'Facility not found' });
  });
};
