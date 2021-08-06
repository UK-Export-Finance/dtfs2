const $ = require('mongo-dot-notation');
const db = require('../../../../drivers/db-client');
const {
  findOneDeal,
  findOneGefDeal,
} = require('../../portal/deal/get-deal.controller');
const tfmController = require('./tfm-get-deal.controller');

const { findAllFacilitiesByDealId } = require('../../portal/facility/get-facilities.controller');

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
  const collection = await db.getCollection('tfm-deals');

  const submissionCount = getSubmissionCount(deal);

  const tfmInit = submissionCount === 1
    ? {
      tfm: DEFAULTS.DEAL_TFM,
    }
    : null;

  const update = {
    dealSnapshot: deal,
    ...tfmInit,
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: String(deal._id) },
    $.flatten(withoutId(update)),
    { returnOriginal: false, upsert: true },
  );

  return findAndUpdateResponse.value;
};

const createFacilitiesSnapshot = async (deal) => {
  const dealFacilities = await findAllFacilitiesByDealId(deal._id);
  const collection = await db.getCollection('tfm-facilities');

  const submissionCount = getSubmissionCount(deal);

  const tfmInit = submissionCount === 1
    ? {
      tfm: DEFAULTS.FACILITY_TFM,
    }
    : null;

  const updatedFacilties = Promise.all(
    dealFacilities.map(async (facility) => collection.findOneAndUpdate(
      { _id: facility._id },
      $.flatten({ facilitySnapshot: facility, ...tfmInit }),
      { returnOriginal: false, upsert: true },
    )),
  );

  return updatedFacilties;
};

const submitDeal = async (deal) => {
  await createDealSnapshot(deal);

  if (deal.dealType !== 'GEF') {
    await createFacilitiesSnapshot(deal);
  }

  const updatedDeal = await tfmController.findOneDeal(String(deal._id));

  return updatedDeal;
};

exports.submitDealPut = async (req, res) => {
  const {
    type: dealType,
    id,
  } = req.params;

  if (dealType === 'GEF') {
    await findOneGefDeal(id, async (deal) => {
      if (deal) {
        const updatedDeal = await submitDeal(deal);
        return res.status(200).json(updatedDeal);
      }

      return res.status(404).send();
    });
  }

  if (dealType === 'BSS/EWCS') {
    await findOneDeal(id, async (deal) => {
      if (deal) {
        const updatedDeal = await submitDeal(deal);
        return res.status(200).json(updatedDeal);
      }

      return res.status(404).send();
    });
  }
};
