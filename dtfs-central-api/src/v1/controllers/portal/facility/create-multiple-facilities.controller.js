const { ObjectId } = require('mongodb');
const db = require('../../../../drivers/db-client');
const { findOneDeal } = require('../deal/get-deal.controller');
const { updateDeal } = require('../deal/update-deal.controller');

const createFacilities = async (facilities, dealId) => {
  const collection = await db.getCollection('facilities');

  const facilitiesWithId = await Promise.all(facilities.map(async (f) => {
    const facility = f;
    facility._id = new ObjectId(facility._id);
    facility.createdDate = Date.now();
    facility.dealId = new ObjectId(dealId);
    return facility;
  }));
  const idsArray = [];
  facilitiesWithId.forEach((f) => {
    idsArray.push(f._id.toHexString());
  });

  const result = await collection.insertMany(facilitiesWithId);

  const dealUpdate = {
    facilities: idsArray,
  };

  await updateDeal(
    dealId,
    dealUpdate,
  );

  const flattenedIds = Object.values(result.insertedIds);

  return flattenedIds;
};

exports.createMultipleFacilitiesPost = async (req, res) => {
  const {
    facilities,
    dealId,
    user,
  } = req.body;

  if (!user) {
    return res.status(404).send();
  }

  return findOneDeal(dealId, async (deal) => {
    if (deal) {
      const insertedFacilities = await createFacilities(facilities, dealId);

      return res.status(200).send(insertedFacilities);
    }

    return res.status(404).send('Deal not found');
  });
};
