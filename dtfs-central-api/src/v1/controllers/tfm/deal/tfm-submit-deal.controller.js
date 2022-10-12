const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const db = require('../../../../database/mongo-client');
const { findOneBssDeal, findOneGefDeal } = require('../../portal/deal/get-deal.controller');
const tfmController = require('./tfm-get-deal.controller');

const { findAllBssFacilitiesByDealId, findAllGefFacilitiesByDealId } = require('../../portal/facility/get-facilities.controller');

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
  if (ObjectId.isValid(deal._id)) {
    const { dealType, _id: dealId } = deal;
    const collection = await db.getCollection('tfm-deals');

    const submissionCount = getSubmissionCount(deal);
    const tfmInit = submissionCount === 1 ? { tfm: DEFAULTS.DEAL_TFM } : null;

    const dealObj = { dealSnapshot: deal, ...tfmInit };

    if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
      const dealFacilities = await findAllBssFacilitiesByDealId(dealId);
      dealObj.dealSnapshot.facilities = dealFacilities;
    }

    const findAndUpdateResponse = await collection.findOneAndUpdate(
      { _id: { $eq: ObjectId(deal._id) } },
      $.flatten(withoutId(dealObj)),
      { returnDocument: 'after', returnNewDocument: true, upsert: true }
    );

    return findAndUpdateResponse.value;
  }
  return { status: 400, message: 'Invalid Deal Id' };
};

const createFacilitiesSnapshot = async (deal) => {
  if (ObjectId.isValid(deal._id)) {
    const { dealType, _id: dealId } = deal;

    let dealFacilities = [];
    if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
      dealFacilities = await findAllBssFacilitiesByDealId(dealId);
    }

    if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
      dealFacilities = await findAllGefFacilitiesByDealId(dealId);
    }

    const collection = await db.getCollection('tfm-facilities');

    const submissionCount = getSubmissionCount(deal);

    const tfmInit = submissionCount === 1 ? { tfm: DEFAULTS.FACILITY_TFM } : null;

    if (dealFacilities) {
      const updatedFacilities = Promise.all(
        dealFacilities.map((facility) =>
          collection.findOneAndUpdate(
            { _id: { $eq: ObjectId(facility._id) } },
            $.flatten({ facilitySnapshot: facility, ...tfmInit }),
            { returnDocument: 'after', returnNewDocument: true, upsert: true }
          )),
      );

      return updatedFacilities;
    }

    return null;
  }
  return { status: 400, message: 'Invalid Deal Id' };
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
    const deal = await findOneGefDeal(dealId);
    if (deal) {
      const facilities = await findAllGefFacilitiesByDealId(dealId);

      deal.facilities = facilities;

      const updatedDeal = await submitDeal(deal);
      res.status(200).send(updatedDeal);
    }

    res.status(404).send();
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    const deal = await findOneBssDeal(dealId);

    if (deal) {
      const updatedDeal = await submitDeal(deal);
      res.status(200).send(updatedDeal);
    }

    res.status(404).send();
  }
};
