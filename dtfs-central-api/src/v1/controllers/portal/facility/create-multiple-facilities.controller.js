const db = require('../../../../drivers/db-client');
const { generateFacilityId } = require('../../../../utils/generate-ids');
const { findOneDeal } = require('../deal/get-deal.controller');
const { updateDeal } = require('../deal/update-deal.controller');
const now = require('../../../../now');

const createFacilities = async (facilities, dealId) => {
  const collection = await db.getCollection('facilities');

  const facilitiesWithId = await Promise.all(facilities.map(async (f) => {
    const facility = f;
    facility.createdDate = now();
    facility._id = await generateFacilityId(); // eslint-disable-line no-underscore-dangle
    facility.associatedDealId = dealId;
    return facility;
  }));


  const idsArray = [];
  facilitiesWithId.forEach((f) => {
    idsArray.push(f._id); // eslint-disable-line no-underscore-dangle
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
    associatedDealId,
    user,
  } = req.body;

  if (!user) {
    return res.status(404).send();
  }

  return findOneDeal(associatedDealId, async (deal) => {
    if (deal) {
      const insertedFacilities = await createFacilities(facilities, associatedDealId);

      return res.status(200).send(insertedFacilities);
    }

    return res.status(404).send('Deal not found');
  });
};
