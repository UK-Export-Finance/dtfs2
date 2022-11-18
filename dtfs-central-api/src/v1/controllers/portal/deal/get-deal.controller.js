const { ObjectId } = require('mongodb');
const db = require('../../../../database/mongo-client');
const { FACILITIES: { FACILITY_TYPE: { BOND, LOAN } } } = require('../../../../constants');

const extendDealWithFacilities = async (deal) => {
  const facilitiesCollection = await db.getCollection('facilities');
  const mappedDeal = { ...deal };
  const mappedBonds = [];
  const mappedLoans = [];
  const facilityIds = deal.facilities;
  const facilities = await facilitiesCollection.find({ dealId: ObjectId(deal._id) }).toArray();

  facilityIds.forEach((id) => {
    const facilityObj = facilities.find((f) => f._id.toHexString() === id);

    if (facilityObj) {
      const { type } = facilityObj;

      if (type === BOND) {
        mappedBonds.push(facilityObj);
      }

      if (type === LOAN) {
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

const findOneBssDeal = async (_id, callback) => {
  const dealsCollection = await db.getCollection('deals');

  const deal = await dealsCollection.findOne({ _id: ObjectId(_id) });

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
exports.findOneBssDeal = findOneBssDeal;

exports.getOneBssDeal = async (req, res) => {
  const deal = await findOneBssDeal(req.params.id);

  if (deal) {
    return res.status(200).send({ deal });
  }

  return res.status(404).send({ status: 404, message: 'Deal not found' });
};

const findOneGefDeal = async (_id, callback) => {
  const dealsCollection = await db.getCollection('deals');

  const deal = await dealsCollection.findOne({ _id: ObjectId(_id) });

  if (callback) {
    callback(deal);
  }

  return deal;
};
exports.findOneGefDeal = findOneGefDeal;

exports.getOneGefDeal = async (req, res) => {
  const deal = await findOneGefDeal(req.params.id);

  if (deal) {
    return res.status(200).send(deal);
  }

  return res.status(404).send({ status: 404, message: 'Deal not found' });
};
