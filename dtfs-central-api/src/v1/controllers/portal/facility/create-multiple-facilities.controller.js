const { ObjectId } = require('mongodb');
const db = require('../../../../database/mongo-client');
const { findOneBssDeal } = require('../deal/get-deal.controller');
const { updateBssDeal } = require('../deal/update-deal.controller');

const createFacilities = async (facilities, dealId) => {
  const collection = await db.getCollection('facilities');

  const facilitiesWithId = await Promise.all(
    facilities.map((f) => {
      const facility = f;
      facility._id = new ObjectId(facility._id);
      facility.createdDate = Date.now();
      facility.updatedAt = Date.now();
      facility.dealId = new ObjectId(dealId);
      return facility;
    }),
  );

  const idsArray = [];
  facilitiesWithId.forEach((f) => {
    idsArray.push(f._id.toHexString());
  });

  const result = await collection.insertMany(facilitiesWithId);

  const dealUpdate = {
    facilities: idsArray,
  };

  await updateBssDeal(dealId, dealUpdate);

  const flattenedIds = Object.values(result.insertedIds);

  return flattenedIds;
};

exports.createMultipleFacilitiesPost = (req, res) => {
  const { facilities, dealId, user } = req.body;

  if (!user) {
    return res.status(404).send();
  }

  return findOneBssDeal(dealId, async (deal) => {
    if (deal) {
      const insertedFacilities = await createFacilities(facilities, dealId);

      return res.status(200).send(insertedFacilities);
    }

    return res.status(404).send('Deal not found');
  });
};
