const $ = require('mongo-dot-notation');
const db = require('../../../../drivers/db-client');
const { findOneDeal } = require('../../portal/deal/get-deal.controller');
const tfmController = require('./tfm-get-deal.controller');

const { findAllFacilitiesByDealId } = require('../../portal/facility/get-facilities.controller');

const withoutId = (obj) => {
  const { _id, ...cleanedObject } = obj;
  return cleanedObject;
};

const createDealSnapshot = async (deal) => {
  const collection = await db.getCollection('tfm-deals');
  const update = {
    dealSnapshot: deal,
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    // eslint-disable-next-line no-underscore-dangle
    { _id: deal._id },
    $.flatten(withoutId(update)),
    { returnOriginal: false, upsert: true },
  );

  return findAndUpdateResponse.value;
};

const createFacilitiesSnapshot = async (dealId) => {
  const dealFacilities = await findAllFacilitiesByDealId(dealId);
  const collection = await db.getCollection('tfm-facilities');

  const updatedFacilties = Promise.all(
    dealFacilities.map(async (facility) => collection.findOneAndUpdate(
    // eslint-disable-next-line no-underscore-dangle
      { _id: facility._id },
      $.flatten({ facilitySnapshot: facility }),
      { returnOriginal: false, upsert: true },
    )),
  );

  return updatedFacilties;
};

const submitDeal = async (deal) => {
  await createDealSnapshot(deal);
  // eslint-disable-next-line no-underscore-dangle
  await createFacilitiesSnapshot(deal._id);

  // eslint-disable-next-line no-underscore-dangle
  const updatedDeal = await tfmController.findOneDeal(deal._id);
  return updatedDeal;
};

exports.submitDealPut = async (req, res) => {
  const { id } = req.params;

  await findOneDeal(id, async (deal) => {
    if (deal) {
      const updatedDeal = await submitDeal(deal);
      return res.status(200).json(updatedDeal);
    }
    return res.status(404).send();
  });
};
