const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const { findOneFacility } = require('./get-facility.controller');
const { removeFacilityIdFromDeal } = require('../deal/update-deal.controller');
const db = require('../../../../drivers/db-client').default;

// eslint-disable-next-line consistent-return
exports.deleteFacility = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const facilityId = req.params.id;

    await findOneFacility(facilityId, async (facility) => {
      if (facility && ObjectId.isValid(facilityId)) {
        const collection = await db.getCollection(MONGO_DB_COLLECTIONS.FACILITIES);
        const status = await collection.deleteOne({ _id: { $eq: ObjectId(facilityId) } });

        // remove facility ID from the associated deal
        const { user } = req.body;

        await removeFacilityIdFromDeal(facility.dealId, facilityId, user, req.routePath);

        return res.status(200).send(status);
      }

      return res.status(404).send({ status: 400, message: 'Facility not found' });
    });
  } else {
    return res.status(400).send({ status: 400, message: 'Invalid Facility Id' });
  }
};
