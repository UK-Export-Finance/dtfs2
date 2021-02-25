const { findOneFacility } = require('./get-facility.controller');
const { removeFacilityIdFromDeal } = require('../deal/update-deal.controller');
const db = require('../../../drivers/db-client');

exports.deleteFacility = async (req, res) => {
  const facilityId = req.params.id;

  findOneFacility(facilityId, async (facility) => {
    if (facility) {
      const collection = await db.getCollection('facilities');
      const tfmCollection = await db.getCollection('facilities');

      const status = await collection.deleteOne({ _id: facilityId });
      await tfmCollection.deleteOne({ _id: facilityId });
      // remove facility ID from the associated deal
      const {
        user,
      } = req.body;

      await removeFacilityIdFromDeal(
        facility.associatedDealId,
        facilityId,
        user,
        req.routePath,
      );

      return res.status(200).send(status);
    }

    return res.status(404).send();
  });
};
