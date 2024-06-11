const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const { mongoDbClient: db } = require('../../../../drivers/db-client');
const CONSTANTS = require('../../../../constants');
const { findAllGefFacilitiesByDealId } = require('../gef-facility/get-facilities.controller');

const extendDealWithFacilities = async (deal) => {
  const facilitiesCollection = await db.getCollection(MONGO_DB_COLLECTIONS.FACILITIES);
  const mappedDeal = { ...deal };
  const mappedBonds = [];
  const mappedLoans = [];
  const facilityIds = deal.facilities;

  const { _id: dealId } = deal;

  if (!ObjectId.isValid(dealId)) {
    throw new Error('Invalid Deal Id');
  }

  const facilities = await facilitiesCollection.find({ dealId: { $eq: ObjectId(dealId) } }).toArray();

  facilityIds.forEach((id) => {
    const facilityObj = facilities.find((f) => f._id.toHexString() === id);

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
  if (!ObjectId.isValid(_id)) {
    throw new Error('Invalid Deal Id');
  }

  const dealsCollection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);

  const deal = await dealsCollection.findOne({ _id: { $eq: ObjectId(_id) } });

  if (deal?.facilities) {
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
  if (ObjectId.isValid(_id)) {
    const dealsCollection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);

    const deal = await dealsCollection.findOne({ _id: { $eq: ObjectId(_id) } });

    if (deal) {
      const facilities = await findAllGefFacilitiesByDealId(_id);

      deal.facilities = facilities;
    }

    if (callback) {
      callback(deal);
    }

    return deal;
  }
  return { status: 400, message: 'Invalid Deal Id' };
};
exports.findOneGefDeal = findOneGefDeal;

exports.findOneDealGet = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const deal = await findOneDeal(req.params.id);

    if (deal) {
      return res.status(200).send({
        deal,
      });
    }

    return res.status(404).send({ status: 404, message: 'Deal not found' });
  }

  return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
};
