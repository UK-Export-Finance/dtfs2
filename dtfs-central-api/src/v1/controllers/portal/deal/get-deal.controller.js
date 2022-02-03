const { ObjectID } = require('mongodb');
const db = require('../../../../drivers/db-client');
const CONSTANTS = require('../../../../constants');
const { findAllGefFacilitiesByDealId } = require('../gef-facility/get-facilities.controller');

const extendDealWithFacilities = async (deal) => {
  const facilitiesCollection = await db.getCollection('facilities');
  const mappedDeal = { ...deal };
  const mappedBonds = [];
  const mappedLoans = [];
  const facilityIds = deal.facilities;
  const facilities = await facilitiesCollection.find({
    _id: {
      $in: facilityIds,
    },
  }).toArray();

  facilityIds.forEach((id) => {
    const facilityObj = facilities.find((f) => f._id === id);

    if (facilityObj) {
      const { type } = facilityObj;

      if (type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND) {
        mappedBonds.push(facilityObj);
      }

      if (type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN) {
        mappedLoans.push(facilityObj);
      }
    }
  });

  if (facilityIds && facilityIds.length > 0) {
    mappedDeal.bondTransactions = {
      items: mappedBonds,
    };

    mappedDeal.loanTransactions = {
      items: mappedLoans,
    };
  }

  return mappedDeal;
};

const findOneDeal = async (_id, callback) => {
  const dealsCollection = await db.getCollection('deals');

  const deal = await dealsCollection.findOne({ _id });

  if (deal && deal.facilities) {
    const facilityIds = deal.facilities;

    if (facilityIds && facilityIds.length > 0) {
      const extendedDeal = await extendDealWithFacilities(deal);
      if (callback) {
        callback(extendedDeal);
      }

      return extendedDeal;
    }
  }

  if (callback) {
    callback(deal);
  }

  return deal;
};
exports.findOneDeal = findOneDeal;

const findOneGefDeal = async (_id, callback) => {
  const dealsCollection = await db.getCollection('deals');

  const deal = await dealsCollection.findOne({ _id: ObjectID(_id) });

  if (deal) {
    const facilities = await findAllGefFacilitiesByDealId(_id);

    deal.facilities = facilities;
  }

  if (callback) {
    callback(deal);
  }

  return deal;
};
exports.findOneGefDeal = findOneGefDeal;

exports.findOneDealGet = async (req, res) => {
  const deal = await findOneDeal(req.params.id);

  if (deal) {
    return res.status(200).send({
      deal,
    });
  }

  return res.status(404).send();
};
