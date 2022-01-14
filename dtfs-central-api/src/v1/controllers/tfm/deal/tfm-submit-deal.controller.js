const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const db = require('../../../../drivers/db-client');
const {
  findOneDeal,
  findOneGefDeal,
} = require('../../portal/deal/get-deal.controller');
const tfmController = require('./tfm-get-deal.controller');

const { findAllFacilitiesByDealId } = require('../../portal/facility/get-facilities.controller');
const { findAllGefFacilitiesByDealId } = require('../../portal/gef-facility/get-facilities.controller');

const DEFAULTS = require('../../../defaults');
const CONSTANTS = require('../../../../constants');

const withoutId = (obj) => {
  const { _id, ...cleanedObject } = obj;
  return cleanedObject;
};

const getSubmissionCount = (deal) => {
  const { dealType } = deal;

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    return deal.submissionCount;
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    return deal.details.submissionCount;
  }

  return null;
};

const createDealSnapshot = async (deal) => {
  const { dealType, _id: dealId } = deal;
  const collection = await db.getCollection('tfm-deals');

  const submissionCount = getSubmissionCount(deal);
  const tfmInit = submissionCount === 1 ? { tfm: DEFAULTS.DEAL_TFM } : null;

  const dealObj = {
    dealSnapshot: deal,
    ...tfmInit,
  };

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    const dealFacilities = await findAllFacilitiesByDealId(dealId);
    dealObj.dealSnapshot.facilities = dealFacilities;
  }

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: { $eq: ObjectId(deal._id) } },
    $.flatten(withoutId(dealObj)),
    { returnOriginal: false, upsert: true },
  );

  return findAndUpdateResponse.value;
};

const createFacilitiesSnapshot = async (deal) => {
  const {
    dealType,
    _id: dealId,
  } = deal;

  let dealFacilities = [];
  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    dealFacilities = await findAllFacilitiesByDealId(dealId);
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    dealFacilities = await findAllGefFacilitiesByDealId(dealId);
  }

  const collection = await db.getCollection('tfm-facilities');

  const submissionCount = getSubmissionCount(deal);

  const tfmInit = submissionCount === 1
    ? {
      tfm: DEFAULTS.FACILITY_TFM,
    }
    : null;

  if (dealFacilities) {
    const updatedFacilities = Promise.all(
      dealFacilities.map(async (facility) => collection.findOneAndUpdate(
        { _id: { $eq: ObjectId(facility._id) } },
        $.flatten({ facilitySnapshot: facility, ...tfmInit }),
        { returnOriginal: false, upsert: true },
      )),
    );

    return updatedFacilities;
  }

};

const submitDeal = async (deal) => {
  await createDealSnapshot(deal);

  await createFacilitiesSnapshot(deal);

  const updatedDeal = await tfmController.findOneDeal(String(deal._id));

  return updatedDeal;
};

exports.submitDealPut = async (req, res) => {
  const { dealId, dealType } = req.body;

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    await findOneGefDeal(dealId, async (deal) => {
      if (deal) {
        const updatedDeal = await submitDeal(deal);
        return res.status(200).json(updatedDeal);
      }

      return res.status(404).send();
    });
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    await findOneDeal(dealId, async (deal) => {
      if (deal) {
        const updatedDeal = await submitDeal(deal);
        return res.status(200).json(updatedDeal);
      }

      return res.status(404).send();
    });
  }
};
